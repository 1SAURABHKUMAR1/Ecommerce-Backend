const Product = require("../models/product");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary").v2;


// add product
exports.addProduct = BigPromise(async (req, res, next) => {

    const { name, price, description, category, stock, brand } = req.body;

    // any field is missing
    if (!(name && price && description && category && stock && brand)) {
        return next(new CustomError('All Fields Are Mandatory!', 400));
    }

    // product is already in db
    const productDB = await Product.findOne({ name });

    if (productDB) {
        return next(new CustomError("Product With This Name Already Exists", 400));
    }

    // no photo is passed
    if (!req.files) {
        return next(new CustomError("Photo is required", 401));
    }

    // upload photo
    let imagesArray = [];

    for (let index = 0; index < req.files.photos.length; index++) {

        let result = await cloudinary.uploader.upload(
            req.files.photos[index].tempFilePath,
            {
                folder: "ecommerce",
            }
        );

        imagesArray.push({
            id: result.public_id,
            secure_url: result.secure_url,
        });

    }

    // create product model
    const product = await Product.create({
        name,
        price,
        description,
        photos: imagesArray,
        category,
        brand,
        stock,
        user: req.user.id,
    });

    // return product model
    res.status(200).json({
        success: true,
        product,
    });

})