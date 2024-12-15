const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { createOrder, getAllOrders, getOrderById, processPaymentController } = require("../controllers/ordersController");
const router = express.Router();
//routes 

router.post('/create-order', createOrder);
router.get('/single-order/:id', getOrderById);
router.get('/all-orders', requireSignIn, isAdmin, getAllOrders);
router.post('/process-payment', processPaymentController);










module.exports = router;