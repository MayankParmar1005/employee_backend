const express = require('express');
const router = express.Router();

const employeeController = require('../controllers/employee.controller');

const {
  sendWhatsAppMessage
} = require('../services/whatsapp.service');

router.get('/', employeeController.getEmployees);

router.get('/test-whatsapp', async(req, res) => {

    try {
        await sendWhatsAppMessage(
            '919898948827',
            'Hello Mayank, WhatsApp integration working successfully.'
        );
    
        res.send('Message Sent');

    } catch(err) {

        console.error('ERROR =>', err);
    
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/:id', employeeController.getEmployeeById);

router.post('/', employeeController.createEmployee);

router.put('/:id', employeeController.updateEmployee);

router.delete('/:id', employeeController.deleteEmployee);



module.exports = router;