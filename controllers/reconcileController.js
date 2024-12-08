const ReconciliationModel = require("../models/ReconciliationModel");

// Create reconciliation controller
const createReconciliationController = async (req, res) => {
    try {
        const { accountID, date, statementDate, statementStartAmount, statementEndAmount } = req.body;

        // Check if all required fields are provided
        if (!accountID || !date || !statementDate || !statementStartAmount || !statementEndAmount) {
            return res.status(400).send({
                success: false,
                message: "All fields are required",
            });
        }

        // Create a new reconciliation entry
        const reconciliation = await new ReconciliationModel({
            accountID,
            date,
            statementDate,
            statementStartAmount,
            statementEndAmount,
        }).save();

        return res.status(201).send({
            success: true,
            message: "New Reconcile Entry Created Successfully",
            reconciliation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in creating Reconciliation Entry",
            error,
        });
    }
};

// Update reconciliation controller
const updateReconciliationController = async (req, res) => {
    try {
        const reconciliationId = req.params.id;
        const { accountID, date, statementDate, statementStartAmount, statementEndAmount } = req.body;

        // Check if all required fields are provided
        if (!accountID || !date || !statementDate || !statementStartAmount || !statementEndAmount) {
            return res.status(400).send({
                success: false,
                message: "All fields are required",
            });
        }

        const existingReconciliation = await ReconciliationModel.findById(reconciliationId);

        if (!existingReconciliation) {
            return res.status(404).send({
                success: false,
                message: "Reconciliation Entry not found",
            });
        }

        // Update the reconciliation entry with the new data
        existingReconciliation.accountID = accountID;
        existingReconciliation.date = date;
        existingReconciliation.statementDate = statementDate;
        existingReconciliation.statementStartAmount = statementStartAmount;
        existingReconciliation.statementEndAmount = statementEndAmount;

        // Save the updated reconciliation entry
        const updatedReconciliation = await existingReconciliation.save();

        return res.status(200).send({
            success: true,
            message: "Reconciliation Entry updated successfully",
            reconciliation: updatedReconciliation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in updating Reconciliation Entry",
            error,
        });
    }
};

// Get all reconciliation entries controller
const getAllReconciliationController = async (req, res) => {
    try {
        const reconciliations = await ReconciliationModel.find({});
        res.status(200).send({
            success: true,
            message: "All Reconciliation Entries listed successfully",
            reconciliations,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in getting All Reconciliation Entries",
            error,
        });
    }
};

// Delete reconciliation entry controller
const deleteReconciliationController = async (req, res) => {
    try {
        const { id } = req.params;
        const reconciliation = await ReconciliationModel.findByIdAndDelete(id);

        res.status(200).send({
            success: true,
            message: "Reconciliation Entry Deleted Successfully",
            reconciliation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Delete Reconciliation Entry",
            error,
        });
    }
};

// Get single reconciliation entry controller
const singleReconciliationController = async (req, res) => {
    const { id } = req.params;
    try {
        const reconciliation = await ReconciliationModel.findById(id);

        if (!reconciliation) {
            return res.status(404).send({
                success: false,
                message: "No reconciliation entry found with this ID",
            });
        }

        res.status(200).send({
            success: true,
            message: "Reconciliation Entry found successfully",
            reconciliation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in getting single reconciliation entry",
            error,
        });
    }
};

module.exports = {
    createReconciliationController,
    updateReconciliationController,
    getAllReconciliationController,
    deleteReconciliationController,
    singleReconciliationController,
};
