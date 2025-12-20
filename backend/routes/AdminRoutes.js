const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const AdminController = require('../controllers/AdminController'); 
const {checkAuthAndAdmin} = require('../middleware/auth');

const uploadOptions = {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    abortOnLimit: true,
    createParentPath: true,
};
router.post('/products/upload', 
    checkAuthAndAdmin, 
    fileUpload(uploadOptions), 
    AdminController.createProduct
);
router.put('/products/:productId', 
    checkAuthAndAdmin, 
    fileUpload(uploadOptions), 
    AdminController.updateProduct
);
router.delete('/products/:productId', 
    checkAuthAndAdmin, 
    AdminController.deleteProduct
);

module.exports = router;