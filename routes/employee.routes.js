const express = require('express');
const router = express.Router();

const employeeController = require('../controllers/employee.controller');

const {
  sendWhatsAppMessage
} = require('../services/whatsapp.service');

router.get('/', employeeController.getEmployees);

router.get('/:id', employeeController.getEmployeeById);

router.post('/', employeeController.createEmployee);

router.put('/:id', employeeController.updateEmployee);

router.delete('/:id', employeeController.deleteEmployee);

router.get('/test-whatsapp', async(req, res) => {

  await sendWhatsAppMessage(
    '919898948827',
    'Hello Mayank, WhatsApp integration working successfully.'
  );

  res.send('Message Sent');
});

module.exports = router;