const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { createReconciliationController, updateReconciliationController, getAllReconciliationController, singleReconciliationController, deleteReconciliationController } = require("../controllers/reconcileController");
const router = express.Router();
//routes 
//create   reconcile
// router.post('/new', requireSignIn, isAdmin,  createAccountController);
router.post('/new', createReconciliationController);
//update  reconcile
// router.put("/:id", requireSignIn, isAdmin, updateAccountController);
router.put("/:id", updateReconciliationController);
//All   reconcilations
// router.get("/reconcilations", getAllReconciliationController );
router.get("/reconcilations", getAllReconciliationController);
//get single  reconcile
router.get("/:id", singleReconciliationController);
//delete   reconcile
// router.delete("/:id", requireSignIn, isAdmin,  deleteReconciliationController);
router.delete("/:id", deleteReconciliationController);













module.exports = router;