const axios = require('axios');

const ACCESS_TOKEN = 'EAAXMZBDZBYZBDIBRlOrncJBbGLygJLyWcUUpI6ibTdj4MV9hVayqs2n4FsBkVtZA7Sfs7VzxO67isQWeTPlygDeN1RpQUMFkK3Q7Ep8kj0I4FHdR4cLgRrDMlddVmkPXcixgsmXnpHToTrdFaUTFIxP7BGHaUmehi4TRIKe7F2sbC7HP7UNF8ZA0WbvY4Oyf0mNZA3pfjYSc3DUVFZCjxN8NjZBwY6uDwqq6Llqpr4lDyQQEGYOMioZCEZA0lZCJ6kddVgaKJ1bgYSMuFZB3tdkQfpad';
const PHONE_NUMBER_ID = '1051419974712862';

// async function sendWhatsAppMessage(to, message) {
async function sendWhatsAppMessage(to, customerName, store_name, bookingDate, bookingTime) {

  try {

    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        // type: 'text',
        // text: {
        //   body: message
        // }

        type: 'template',
        template: {
          name: 'booking_reminder', // Meta's default test template
          language: {
            code: 'en'
          },
          // msg parameter
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: customerName
                },
                {
                  type: 'text',
                  text: store_name
                },
                {
                  type: 'text',
                  text: bookingDate
                },
                {
                  type: 'text',
                  text: bookingTime
                }
              ]
            }
          ]
          // msg parameter
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(response.data);

  } catch(error) {
    console.error(error.response?.data || error.message);
  }
}

module.exports = {
  sendWhatsAppMessage
};