const CategoryModel = require("../models/CategoryModel");
const EntryModel = require("../models/EntryModel");
//create category
const createCategoryController = async (req, res) => {
    try {
        const { name, hidden } = req.body;
        if (!name) {
            return res.status(400).send({
                success: false,
                message: "Name is Required"
            });
        }

        // Check if the category with the given name already exists
        const existingCategory = await CategoryModel.findOne({ name });

        if (existingCategory) {
            return res.status(200).send({
                success: true,
                message: "Category Already Exists !!"
            });
        }

        // Create a new category with the provided name and hidden status
        const category = await new CategoryModel({ name, hidden }).save();

        if (category) {
            return res.status(201).send({
                success: true,
                message: "New Category Created Successfully !!",
                category
            });
        } else {
            return res.status(500).send({
                success: false,
                message: "Error in creating Category"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in creating Category",
            error
        });
    }

};

//update category 
const updateCategoryController = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, hidden } = req.body;

        if (!name) {
            return res.status(400).send({
                success: false,
                message: "Name is Required"
            });
        }

        const existingCategory = await CategoryModel.findById(categoryId);

        if (!existingCategory) {
            return res.status(404).send({
                success: false,
                message: "Category not found"
            });
        }

        const isNameTaken = await CategoryModel.findOne({ name, _id: { $ne: categoryId } });

        if (isNameTaken) {
            return res.status(200).send({
                success: true,
                message: "Category name already exists"
            });
        }

        // Update the category with the new data
        existingCategory.name = name;
        existingCategory.hidden = hidden;

        // Save the updated category
        const updatedCategory = await existingCategory.save();

        return res.status(200).send({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in updating category",
            error
        });
    }
};

//get all categories 
const categoryController = async (req, res) => {
    try {
        const category = await CategoryModel.find({});
        res.status(200).send({
            success: true,
            message: "All Categories listed SuccessFully !!",
            category
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting All Categories Api",
            error
        });
    }
};

// Hidden false categories 

const ShowCategoryController = async (req, res) => {
    try {
        const category = await CategoryModel.find({ hidden: false });
        res.status(200).send({
            success: true,
            message: "All Categories listed Successfully !!",
            category
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting All Categories API",
            error
        });
    }
};



//delete category controller 
const deleteCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        const used = await EntryModel.findOne({ categoryID: id });
        if (used) {
            return res.status(200).send({
                success: false,
                message: "Category is Used for Entry Can not be Deleted !!"
            });
        }
        const category = await CategoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "Category Deleted SuccessFully !!",
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Delete Category Api",
            error
        });
    }
};
//single category controller 
const singleCategoryController = async (req, res) => {
    try {
        const category = await CategoryModel.findOne({ slug: req.params.slug });
        if (!category) {
            return res.status(404).send({
                success: false,
                message: "No category found with this Name",
            });
        }
        res.status(200).send({
            success: true,
            message: "Category found successfully",
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting single category",
            error
        });
    }
};



module.exports = { createCategoryController, updateCategoryController, categoryController, deleteCategoryController, singleCategoryController, ShowCategoryController };