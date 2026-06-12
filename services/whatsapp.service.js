const axios = require('axios');

const ACCESS_TOKEN = 'EAAXMZBDZBYZBDIBRgLZCC8VnCZCV9REJKCgsW1XU04HL0oMxZBygNBzLl9B4z0WnxHQuI7A5mIKotFHAoVjrPMIBmm5wC525ppDybvt19H8IdTDXrkG7YcEQx0xo1qkWVjwt3wFSqZAt6NDJR56qP1lfl099G5qZA5l22yLGZAvZBa9wnJ9c4etZCgEHHa3Geyq9pFYfmT2XZCZAbjZAHUKP16ZAJvj0pQR0be13KaSDBct3ZCn2s2HxkdrIcsklbZBW7ZCOSOKGQYm4ikN6kXTjeHgNl5ZBKtw';
const PHONE_NUMBER_ID = '1051419974712862';

async function sendWhatsAppMessage(to, message) {

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
          name: 'hello_world', // Meta's default test template
          language: {
            code: 'en_US'
          }
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