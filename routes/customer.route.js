const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

// Put this validation check above your /:id parameter routes
router.get('/check-availability', customerController.checkAvailability);

// CRUD endpoints mapping
router.get('/', customerController.getCustomers);           // List
router.get('/:id', customerController.getCustomerById);     // View
router.post('/', customerController.createCustomer);        // Add
router.put('/:id', customerController.updateCustomer);      // Edit
router.delete('/:id', customerController.deleteCustomer);   // Delete

// Place this route alongside your other GET routes
router.get('/:id/appointments', customerController.getCustomerAppointmentHistory);



module.exports = router;