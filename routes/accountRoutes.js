const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { createAccountController, updateAccountController, GetAllAccountsController, deleteAccountController, singleAccountController, GetAllSAccountsController, createMultipleAccountsController } = require("../controllers/accountController");
const router = express.Router();
//routes 
//create  account
// router.post('/create-category', requireSignIn, isAdmin,  createAccountController);
router.post('/new', createAccountController);
router.post('/upload', createMultipleAccountsController);
//update account
// router.put("/:id", requireSignIn, isAdmin, updateAccountController);
router.put("/:id", updateAccountController);
//All  accounts
// router.get("/accounts",GetAllAccountsController );
router.get("/accounts", GetAllAccountsController);
router.get("/saccounts", GetAllSAccountsController);
//get single  account
router.get("/:id", singleAccountController);
//delete  account
// router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteAccountController);
router.delete("/:id", deleteAccountController);













module.exports = router;