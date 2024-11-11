const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    stockCode: { type: String, unique: false, required: false },                            // Stock code of the product
    categoryCode: { type: String, required: false },                    // Category code, optional
    categoryName: { type: String, required: false },                    // Category name, optional
    subcategory: { type: String, required: false },                     // Subcategory name, optional
    shortDescription: { type: String, required: false },                // Short description, optional
    longDescription: { type: String, required: false },                 // Long description, optional
    barcode: { type: String, sparse: true },              // Barcode, optional and unique
    dbp: { type: Number, required: false, default: 0 },                 // Distribution Base Price, optional
    rrp: { type: Number, required: false, default: 0 },                 // Recommended Retail Price, optional
    image: { type: String, required: false },                           // Image URL or path, optional
    manufacturer: { type: String, required: false },                    // Manufacturer, optional
    manufacturerSku: { type: String, required: false },                 // Manufacturer SKU, optional
    weight: { type: Number, required: false, default: 0 },              // Weight in kg or g, optional
    length: { type: Number, required: false, default: 0 },              // Length in cm, optional
    width: { type: Number, required: false, default: 0 },               // Width in cm, optional
    height: { type: Number, required: false, default: 0 },              // Height in cm, optional
    warranty: { type: String, required: false },                        // Warranty period, optional
    optionalAccessories: { type: [String], default: [] },               // Accessories list, optional, default empty array
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
