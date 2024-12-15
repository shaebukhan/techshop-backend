const ProductModel = require('../models/ProductModel');



const addProductsController = async (req, res) => {
    const products = req.body.products;

    // Check if products are provided
    if (!products || products.length === 0) {
        return res.status(400).json({ success: false, message: 'No product data received' });
    }

    // Prepare the data for insertion
    const preparedProducts = products.map((product, index) => ({

        stockCode: product.stock || `UNKNOWN${index}`,
        barcode: product.barcode || null,
        categoryCode: product.categorycode || "",
        categoryName: product.categoryname || "",
        subcategory: product.subcategory || "",
        warranty: product.warranty || "",
        price: parseFloat(product.price) || 0,
        image: product.image || "",
        longDescription: product.ldesc || "",
        shortDescription: product.sdesc || "",
        height: parseFloat(product.height) || 0,
        length: parseFloat(product.length) || 0,
        manufacture: product.manufacture || "",
        manufacturerSku: product.manufacturesku || "",
        optionalAccessories: product.optionalaccessories
            ? product.optionalaccessories.split(',').map((item) => item.trim())
            : [],
        weight: parseFloat(product.weight) || 0,
        width: parseFloat(product.width) || 0,
    }));


    try {
        // Insert all products without conditions (no filtering or upserting)
        await ProductModel.insertMany(preparedProducts, { ordered: false });

        // Response for successful addition
        return res.status(201).json({
            success: true,
            message: 'All products added successfully',
            totalProcessed: products.length,
        });
    } catch (error) {
        console.error('Error saving products:', error);

        // Handle duplicate key errors gracefully (if any)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Some products were not added due to duplicate entries',
                error: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error saving products',
            error: error.message,
        });
    }
};

//get all products
const getAllProductsController = async (req, res) => {
    try {
        // Fetch 100 random products using MongoDB's aggregation with $sample
        const products = await ProductModel.aggregate([
            { $sample: { size: 100 } } // Randomly select 100 products
        ]);

        res.status(200).json({ success: true, products });
    } catch (error) {
        // Handle any errors that occur during the database operation
        res.status(500).json({ message: 'Error retrieving products', error });
    }
};
//get categories unique 

const getAllUniqueCategoriesController = async (req, res) => {
    try {
        // Fetch unique category names
        const categories = await ProductModel.distinct("categoryName");

        res.status(200).json({ success: true, categories });
    } catch (error) {
        // Handle any errors that occur during the database operation
        res.status(500).json({ success: false, message: 'Error retrieving categories', error });
    }
};


//related products
const getAllRelatedProductsController = async (req, res) => {
    try {
        const { categoryCode } = req.params;
        const excludeId = req.query.exclude; // Update to match the frontend query param
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!categoryCode) {
            return res.status(400).json({ success: false, message: 'Category code is required' });
        }

        // Prepare the filter object with ObjectId
        const filter = {
            categoryCode,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}) // Exclude the specific product ID if provided
        };

        const totalProducts = await ProductModel.countDocuments(filter);
        const relatedProducts = await ProductModel.find(filter)
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            relatedProducts,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving products', error });
    }
};
//get all total 

const getTotalProductsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Get the total number of products
        const totalProducts = await ProductModel.countDocuments();

        // Fetch products with pagination
        const products = await ProductModel.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            products,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving products', error });
    }
};



//category products 

const getAllCategoryProductsController = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!categoryName) {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }

        // Define the filter based on the categoryName
        const filter = { categoryName };  // Assuming 'categoryName' is the correct field in your Product model

        // Count total products for pagination
        const totalProducts = await ProductModel.countDocuments(filter);

        // Fetch products with pagination
        const relatedProducts = await ProductModel.find(filter)
            .skip((page - 1) * limit) // Skip items for previous pages
            .limit(limit); // Limit the results to the specified amount per page

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            relatedProducts,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving products', error });
    }
};
//sub categories 

const getAllSubCategoriesController = async (req, res) => {
    try {
        const { categoryName } = req.params;

        if (!categoryName) {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }

        // Aggregate to find unique subcategories for the given categoryName
        const uniqueSubCategories = await ProductModel.aggregate([
            { $match: { categoryName } }, // Filter by categoryName
            { $group: { _id: "$subcategory" } }, // Group by subcategory field to get unique values
            { $sort: { _id: 1 } } // Optional: Sort alphabetically
        ]);

        // Map the result to return only the subcategory names
        const subCategories = uniqueSubCategories.map(item => item._id);

        res.status(200).json({
            success: true,
            subCategories,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving subcategories', error });
    }
};
//change category 
// const changeCategoryNameController = async () => {
//     try {
//         const oldSubcategory = "Systems - NUC/SFF/AIO"; // Subcategory to find
//         const newSubcategory = "Desktop Computers"; // New subcategory name to update

//         // Update products with the old subcategory name
//         const result = await ProductModel.updateMany(
//             { categoryName: oldSubcategory }, // Filter by old subcategory
//             { $set: { categoryName: newSubcategory } } // Update the subcategory name
//         );

//         // Check if any products were updated
//         if (result.modifiedCount > 0) {
//             console.log(`${result.modifiedCount} products updated successfully.`);
//         } else {
//             console.log("No products found with the specified subcategory.");
//         }
//     } catch (error) {
//         // Handle any errors that occur during the update
//         console.error("Error updating subcategory:", error);
//     }
// };

// Directly call the function wherever you need it
// changeCategoryNameController();


//getsubcategoriesproducts 

const getSubCategoryProductsController = async (req, res) => {
    try {
        const { subcategory } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!subcategory) {
            return res.status(400).json({ success: false, message: 'Sub Category is required' });
        }

        // Define the filter based on the categoryName
        const filter = { subcategory };  // Assuming 'categoryName' is the correct field in your Product model

        // Count total products for pagination
        const totalProducts = await ProductModel.countDocuments(filter);

        // Fetch products with pagination
        const subcategoryproducts = await ProductModel.find(filter)
            .skip((page - 1) * limit) // Skip items for previous pages
            .limit(limit); // Limit the results to the specified amount per page

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            subcategoryproducts,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving products', error });
    }
};

//search product
const SearchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 20; // Default limit of 20 products per page
        const skip = (page - 1) * limit;

        // Search query
        const searchCriteria = {
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { longDescription: { $regex: keyword, $options: "i" } },
                { shortDescription: { $regex: keyword, $options: "i" } },
                { categoryName: { $regex: keyword, $options: "i" } },
                { categoryCode: { $regex: keyword, $options: "i" } },
                { subcategory: { $regex: keyword, $options: "i" } }
            ]
        };

        // Fetch total count of results for pagination
        const totalResults = await ProductModel.countDocuments(searchCriteria);
        const results = await ProductModel.find(searchCriteria).skip(skip).limit(limit);

        res.json({
            results,
            totalResults,
            totalPages: Math.ceil(totalResults / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Error in Search Product API",
            error: error.message
        });
    }
};


//get single product 

const getSingleProductController = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await ProductModel.findById(id);
        if (!product) {
            return res.status(204).send({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).send({
            success: true,
            product,

        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in fetching product with entries",
            error,
        });
    }
};
//update 
const updateProductController = async (req, res) => {
    try {
        const productId = req.params.id; // Get productId from the URL params
        const {
            image,
            shortDescription,
            longDescription,
            stockCode,
            categoryCode,
            categoryName,
            subcategory,
            barcode,
            dbp,
            rrp,
            manufacturer,
            manufacturerSku,
            weight,
            length,
            width,
            height,
            warranty,
            optionalAccessories
        } = req.body; // Destructure values from the request body

        // Find the existing product by ID
        const existingProduct = await ProductModel.findById(productId);

        if (!existingProduct) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }

        // Update the product fields with new data from req.body
        existingProduct.image = image;
        existingProduct.shortDescription = shortDescription;
        existingProduct.longDescription = longDescription;
        existingProduct.stockCode = stockCode;
        existingProduct.categoryCode = categoryCode;
        existingProduct.categoryName = categoryName;
        existingProduct.subcategory = subcategory;
        existingProduct.barcode = barcode;
        existingProduct.dbp = dbp;
        existingProduct.rrp = rrp;
        existingProduct.manufacturer = manufacturer;
        existingProduct.manufacturerSku = manufacturerSku;
        existingProduct.weight = weight;
        existingProduct.length = length;
        existingProduct.width = width;
        existingProduct.height = height;
        existingProduct.warranty = warranty;
        existingProduct.optionalAccessories = optionalAccessories;

        // Save the updated product
        const saveProduct = await existingProduct.save();

        return res.status(200).send({
            success: true,
            message: "Product updated successfully",
            saveProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in updating product",
            error
        });
    }
};



const deleteProductController = async (req, res) => {
    try {

        const { id } = req.params;

        const product = await ProductModel.findByIdAndDelete(id);
        if (!product) {
            return res.status(201).json({ success: false, message: 'Product not found.' });
        }
        res.status(200).send({
            success: true,
            message: "Product Deleted SuccessFully !!",

        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Delete Product Api",
            error
        });
    }
};


module.exports = { addProductsController, getAllProductsController, getSingleProductController, updateProductController, deleteProductController, getAllRelatedProductsController, getAllCategoryProductsController, getAllUniqueCategoriesController, SearchProductController, getTotalProductsController, getAllSubCategoriesController, getSubCategoryProductsController };
