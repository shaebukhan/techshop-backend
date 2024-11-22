const mongoose = require('mongoose');

// Declare the Schema for the Transaction model
const transactionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    userID: {
        type: mongoose.ObjectId,
        ref: "Users",
        required: true
    },
    amount:
    {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        required: true
    },
    type: {
        type: String,
    }
    ,
    currency:
    {
        type: String,
        required: true
    },
    salesFee:
    {
        type: Number,

    },
    salesFee:
    {
        type: Number,

    },
    hedgingFee:
    {
        type: Number,

    },
    status: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },

});

// Export the Transaction model
module.exports = mongoose.model('Transactions', transactionSchema);
