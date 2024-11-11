const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { updateEntryController, deleteEntryController, GetAllEntryController } = require("../controllers/entryController");
const router = express.Router();
//routes
//create 
// router.post('/create-category', requireSignIn, isAdmin,  createAccountController);
// router.post('/new', createTransactionController);
//update account
// router.put("/:id", requireSignIn, isAdmin, updateAccountController);
router.put("/:id", updateEntryController);
//All   Entries
router.get("/entries", GetAllEntryController);
//get single  account
// router.get("/:id", singleTransactionController);
//delete  transaction
// router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteAccountController);
router.delete("/:id", deleteEntryController);

module.exports = router;