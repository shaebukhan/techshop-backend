
const TransactionModel = require("../models/TransactionModel");
const UserModel = require("../models/UserModel");
const nodemailer = require('nodemailer');
const createTransporter = require("../config/emailConfig");


// Controller to handle transaction creation
const createTransactionController = async (req, res) => {
    // Destructure and rename fields to match frontend
    const {
        name,
        email,
        userId,
        amount,
        paymentMethod,
        currency,
        pinCode,
        salesChecked,
        salesPercentage,
        hedgingChecked,
        hedgingPercentage,
    } = req.body;

    // Define the admin PIN securely, preferably using environment variables
    const ADMIN_PIN = process.env.ADMIN_PIN || 'admin1234';

    console.log('Transaction Request Body:', req.body);

    // Input Validation
    if (!userId || !amount || !paymentMethod || !currency || !pinCode) {
        return res.status(400).json({
            success: false,
            message: 'All fields (userId, amount, paymentMethod, currency, pinCode) are required.',
        });
    }

    try {
        // Find the user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Validate the PIN code
        if (ADMIN_PIN !== pinCode) {
            return res.status(403).json({ success: false, message: 'Invalid PIN code.' });
        }

        // Initialize sales and hedging fees
        let salesFee = 0;
        let hedgingFee = 0;

        // Calculate sales fee if applicable
        if (salesChecked) {
            salesFee = (salesPercentage / 100) * amount; // Deduct sales percentage from amount
        }

        // Calculate hedging fee if applicable
        if (hedgingChecked) {
            hedgingFee = (hedgingPercentage / 100) * amount; // Deduct hedging percentage from amount
        }

        // Calculate the total amount after deductions
        const totalDeduction = salesFee + hedgingFee;
        const finalAmount = amount - totalDeduction;

        // Create a new transaction
        const newTransaction = new TransactionModel({
            name,
            email,
            userID: userId,
            amount: finalAmount, // Use the final amount after deductions
            paymentMethod,
            currency,
            salesFee,
            hedgingFee,
            type: "Deposit",
        });

        await newTransaction.save();

        // Update user balance
        const updatedBalance = Number(user.balance) + Number(finalAmount); // Add final amount to user balance
        user.balance = updatedBalance;

        // Save the updated user balance
        await user.save();

        // Send transaction email
        try {
            await sendTransactionEmail(user.email, user.name, newTransaction);
        } catch (emailError) {
            console.error('Failed to send transaction email:', emailError);
        }

        // Respond with success
        return res.status(201).json({ success: true, message: 'Transaction successful!', newTransaction });
    } catch (error) {
        console.error('Transaction error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};




// Update transaction controller
const updateTransactionController = async (req, res) => {
    try {
        const { date, account, name, rows } = req.body;
        const transactionId = req.params.id;

        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Update the transaction
        const updatedTransaction = await TransactionModel.findByIdAndUpdate(transactionId, {
            date: formattedDate,
            accountID: account,
            name
        }, { new: true }); // Set { new: true } to return the updated document

        // Delete existing entries for the transaction
        await EntryModel.deleteMany({ transactionID: transactionId });

        // Create new entries for the transaction
        const entries = await Promise.all(rows.map(async (row) => {
            const { category, amount, comments } = row;
            const entry = await EntryModel.create({
                categoryID: category,
                amount,
                comments,
                transactionID: transactionId,
            });
            return entry;
        }));

        return res.status(200).send({
            success: true,
            message: "Transaction and entries updated successfully",
            transaction: updatedTransaction,
            entries,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in updating transaction and entries",
            error,
        });
    }
};


// Mark transaction as reconciled
const markTransactionReconciledController = async (req, res) => {
    try {
        const { transactionId, reconciliationId } = req.body;

        const transaction = await TransactionModel.findById(transactionId);

        if (!transaction) {
            return res.status(404).send({
                success: false,
                message: "Transaction Entry not found",
            });
        }

        // Check if the transaction is already marked as reconciled
        if (transaction.reconciliationID) {
            return res.status(400).send({
                success: false,
                message: "Transaction Entry is already reconciled",
            });
        }

        // Check if the provided reconciliationId is valid
        const reconciliation = await ReconciliationModel.findById(reconciliationId);

        if (!reconciliation) {
            return res.status(404).send({
                success: false,
                message: "Reconciliation not found",
            });
        }

        // Update the transaction with reconciliation information
        transaction.reconciliationID = reconciliationId;

        // Save the updated transaction
        const updatedTransaction = await transaction.save();

        return res.status(200).send({
            success: true,
            message: "Transaction Entry marked as reconciled successfully",
            transaction: updatedTransaction,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in marking Transaction Entry as reconciled",
            error,
        });
    }
};
// Get all transaction entries controller
const getAllTransactionsController = async (req, res) => {
    try {
        // Fetch all transactions
        const transactions = await TransactionModel.find({});
        if (!transactions || transactions.length === 0) {
            return res.status(204).json({ success: false, message: "No transactions found" });
        }
        return res.status(200).send({
            success: true,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in fetching transactions with entries",
            error,
        });
    }
};


// Delete transaction entry controller
const deleteTransactionController = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        const transaction = await TransactionModel.findByIdAndDelete(id);
        if (!transaction) {
            return res.status(201).json({ success: false, message: 'transaction not found.' });
        }
        res.status(200).send({
            success: true,
            message: "Transaction Entry Deleted Successfully",
            transaction,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Delete Transaction Entry",
            error,
        });
    }
};

// Get single transaction entry controller
const singleTransactionController = async (req, res) => {
    // Fetch a single transaction with its corresponding entries

    try {
        const { id } = req.params;

        // Fetch transaction with the given transactionId
        const transaction = await TransactionModel.findById(id);
        if (!transaction) {
            return res.status(204).send({
                success: false,
                message: "Transaction not found",
            });
        }

        return res.status(200).send({
            success: true,
            message: "Transaction with entries fetched successfully",
            transaction,

        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in fetching transaction with entries",
            error,
        });
    }
};



const sendTransactionEmail = async (email, name, newTransaction) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
        from: 'PQS Team <no-reply@pqs.com>', // Change sender to a more professional address
        to: email,
        subject: 'Credit Transaction Alert',
        html: `
        <div style="background: #0E2340; text-align: center;">
            <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px;">PQS</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Dear <span >${name}</span>,</h5>
            <p style="color: #333; font-size: 16px; margin-bottom: 5px;">${newTransaction.amount}  ${newTransaction.currency}   received to your account with the following details:</p>
            <p style="color: #333; font-size: 16px; margin-bottom: 5px;">Here are the transaction details:</p>
            <ul style="list-style-type: none; padding: 0; color: #333;">
                <li><strong>Transaction ID:</strong> ${newTransaction._id}</li>
                <li><strong>Amount:</strong> ${newTransaction.amount}</li>
                <li><strong>Payment Method:</strong> ${newTransaction.paymentMethod}</li>
                <li><strong>Currency:</strong> ${newTransaction.currency}</li>
                <li><strong>Date:</strong> ${new Date(newTransaction.date).toLocaleString()}</li>
            </ul>
            
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Best regards,<br>PQS Team</h5>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
            <h6>This is an automated message, please do not reply to this email.</h6>
        </div>`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};


module.exports = {
    createTransactionController, singleTransactionController, updateTransactionController, getAllTransactionsController, deleteTransactionController
};
