const express = require("express");
const multer = require('multer');
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { addProductsController, getAllProductsController, getSingleProductController, updateProductController, deleteProductController, getAllRelatedProductsController, getAllCategoryProductsController, getAllUniqueCategoriesController, SearchProductController, getTotalProductsController } = require("../controllers/productController");
const router = express.Router();
const upload = multer();

router.post('/add-products', upload.none(), requireSignIn, isAdmin, addProductsController);
router.get('/get-products', getAllProductsController);
router.get('/get-all', getTotalProductsController);
router.get('/categories', getAllUniqueCategoriesController);
router.get('/get-related-products/:categoryCode', getAllRelatedProductsController);
router.get('/category-products/:categoryName', getAllCategoryProductsController);
router.get('/single-product/:id', getSingleProductController);
router.get('/search/:keyword', SearchProductController);
router.put('/update-product/:id', requireSignIn, isAdmin, updateProductController);
router.delete('/delete-product/:id', requireSignIn, isAdmin, deleteProductController);


module.exports = router;
