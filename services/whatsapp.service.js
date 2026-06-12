const axios = require('axios');

const ACCESS_TOKEN = 'EAAXMZBDZBYZBDIBRqwsrf8oD08qhZCahLPdnvxxzdadZCnCeWWFD3sHYCO82S5gdXHeYnRt1xAfvZCLLOOnMCqZArOPOGjBIxGbRKHLOvADSHZBkJ3sKcCGOXlLciwUAytLZA3xlUXMtfj1ytKDr4ioIOOXMw6PSp8OIA0s5O0enPcbxXBp2G2yd3bCDggpJMbcZAfx4qHLgjAPz1zZAn47vLTAXqutXJPvlIiYTfPaOUJb0hhwbrH4RwvBs3YxtbZBpLYLxKBuPtJruRVkNjKZA7YHuzCNaZA';
const PHONE_NUMBER_ID = '1051419974712862';

async function sendWhatsAppMessage(to, message) {

  try {

    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${1051419974712862}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          Authorization: `Bearer ${EAAXMZBDZBYZBDIBRqwsrf8oD08qhZCahLPdnvxxzdadZCnCeWWFD3sHYCO82S5gdXHeYnRt1xAfvZCLLOOnMCqZArOPOGjBIxGbRKHLOvADSHZBkJ3sKcCGOXlLciwUAytLZA3xlUXMtfj1ytKDr4ioIOOXMw6PSp8OIA0s5O0enPcbxXBp2G2yd3bCDggpJMbcZAfx4qHLgjAPz1zZAn47vLTAXqutXJPvlIiYTfPaOUJb0hhwbrH4RwvBs3YxtbZBpLYLxKBuPtJruRVkNjKZA7YHuzCNaZA}`,
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