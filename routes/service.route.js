const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');

// Service CRUD routing setup
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;