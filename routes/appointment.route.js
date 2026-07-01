const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment.controller');

// 1. Customer Lookup Route (Put this BEFORE /:id so Express doesn't confuse the mobile number with an ID)
router.get('/mobile/:mobile', appointmentController.getCustomerByMobile);

router.get('/booked-slots', appointmentController.getBookedSlots);

// 2. Standard Appointment Routes
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;