const express = require('express');
const router = express.Router();

// for image upload
const multer = require('multer');
const path = require('path');

const employeeController = require('../controllers/employee.controller');

// 1. Configure where to save files and how to name them uniquely
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Make sure you create an empty 'uploads' folder in your backend project root!
    },
    filename: (req, file, cb) => {
      // Generates: employee-1719771234567.jpg
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Set file filters to ensure only images are accepted
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

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

router.post('/', upload.single('employee_image'), employeeController.createStaff);

router.put('/:id', upload.single('employee_image'), employeeController.updateStaff);

router.delete('/:id', employeeController.deleteEmployee);



module.exports = router;