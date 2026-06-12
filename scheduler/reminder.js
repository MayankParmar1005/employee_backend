const cron = require('node-cron');
const pool = require('../db/db');

const { sendWhatsAppMessage } = require('../services/whatsapp.service');

cron.schedule('* * * * *', async() => {

  console.log('Checking reminders...');

  const result = await pool.query(`
    SELECT *
    FROM appointments
    WHERE reminder_sent = false
  `);

  for(const booking of result.rows) {

    const bookingTime = new Date(booking.booking_time);

    const reminderTime =
      bookingTime.getTime() -
      (2 * 60 * 1000);

    if(Date.now() >= reminderTime) {
        console.log('cron job called!!');

    await sendWhatsAppMessage(
        '919898948827',
        'Hello Mayank, WhatsApp integration working successfully.'
    );

    // res.send('Message Sent');

      

      await pool.query(
        `
        UPDATE appointments
        SET reminder_sent=true
        WHERE id=$1
        `,
        [booking.id]
      );
    }
  }

});