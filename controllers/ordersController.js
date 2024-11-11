const OrderModel = require('../models/OrdersModel'); // Import the Order model
const ProductModel = require("../models/ProductModel");
// Create a new order
const createOrder = async (req, res) => {
    try {
        const { userId, products, shippingInfo } = req.body;

        // Calculate the total amount
        const totalAmount = products.reduce((sum, product) => {
            return sum + (product.price * product.quantity);
        }, 0);

        // Create a new order instance
        const order = new OrderModel({
            userId,
            products,
            totalAmount,
            shippingInfo,
        });

        // Save the order to the database
        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message,
        });
    }
};


const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.body);

        if (!id) {
            return res.status(204).send({
                success: false,
                message: "No Order Exists",
            });
        }

        // Fetch the order based on the given order ID
        const order = await OrderModel.findById(id);

        if (!order) {
            return res.status(204).send({
                success: false,
                message: "Order not found",
            });
        }

        // Extract product IDs from the order
        const productIds = order.products.map(product => product.productId);

        // Fetch the product details from ProductModel for each product ID
        const products = await ProductModel.find({ _id: { $in: productIds } });

        // Map products with their respective quantity and price from the order
        const orderProducts = order.products.map(item => {
            const productDetails = products.find(product => product._id.toString() === item.productId.toString());
            return {
                ...productDetails._doc,
                quantity: item.quantity,
                price: item.price,
            };
        });

        res.status(200).json({
            success: true,
            order: {
                ...order._doc,
                products: orderProducts,
            },
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message,
        });
    }
};


const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({});
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message,
        });
    }
};

// Export controller functions
module.exports = {
    createOrder,
    getAllOrders,
    getOrderById
};
