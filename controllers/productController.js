const Product = require("../models/product");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary").v2;
const WhereClause = require("../utils/whereClause");


// add product
exports.addProduct = BigPromise(async (req, res, next) => {

    const { name, price, description, category, stock, brand } = req.body;

    // any field is missing
    if (!(name && price && description && category && stock && brand)) {
        return next(CustomError(res, "All Fields Are Mandatory!", 400));
    }

    // product is already in db
    const productDB = await Product.findOne({ name });

    if (productDB) {
        return next(CustomError(res, "Product Name Already Exists", 400));
    }

    // no photo is passed
    if (!req.files) {
        return next(CustomError(res, "Photo is required", 401));
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


// filter product -- if no query return all product else filter via query
exports.filterProduct = BigPromise(async (req, res, next) => {

    // result in one page
    let resultPerPage = 3;

    // if passed limit per page
    if (req.query.limit) {
        resultPerPage = req.query.limit;
    }

    // total product in db
    const totalProducts = await Product.countDocuments();

    // filter via query
    const productObj = new WhereClause(Product.find(), req.query).search().filter();

    // total filtered products
    let product = await productObj.baseURL;
    const totalFilteredResults = product.length;

    // pagination
    productObj.pager(resultPerPage);
    product = await productObj.baseURL.clone();

    // response
    res.status(200).json({
        success: true,
        product,
        resultPerPage,
        totalFilteredResults,
        totalProducts,
    })

})


// get all products admin
exports.adminGetAllProducts = BigPromise(async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    })

});


// get single product
exports.getSingleProduct = BigPromise(async (req, res, next) => {

    const productId = req.params.id;

    // product is is not passed
    if (!productId) {
        return next(CustomError(res, "Product Id Is Required!", 401));
    }

    // find all data
    const product = await Product.findById(productId);

    // no product found
    if (!product) {
        return next(CustomError(res, "No Product Found!", 401));
    }

    res.status(200).json({
        success: true,
        product
    });

});


// update information of product
exports.adminUpdateProductInfo = BigPromise(async (req, res, next) => {

    const productId = req.params.id;

    // id not passed
    if (!productId) {
        return next(CustomError(res, "Product ID Is Required!", 401));
    }

    let product = await Product.findById(productId);

    // product not found in db
    if (!product) {
        return next(CustomError(res, "Product Not Found", 400));
    }

    // if photo is present
    const imagesArray = [];

    if (req.files) {

        // delete existing photos
        const existingPhotos = product.photos;
        for (let index = 0; index < existingPhotos.length; index++) {
            await cloudinary.uploader.destroy(existingPhotos[index].id);
        }

        // upload new photos
        for (let index = 0; index < req.files.photos.length; index++) {
            const imageUpload = await cloudinary.uploader.upload(
                req.files.photos[index].tempFilePath,
                {
                    folder: "ecommerce",
                }
            )

            imagesArray.push({
                id: imageUpload.public_id,
                secure_url: imageUpload.secure_url,
            })
        }

    }

    // update user in body
    req.body.photos = imagesArray;
    req.body.user = req.user.id;

    product = await Product.findByIdAndUpdate(productId, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        product,
    })

});