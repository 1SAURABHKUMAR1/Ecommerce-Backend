const Product = require('../models/product');
const BigPromise = require('../middleware/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary').v2;
const WhereClause = require('../utils/whereClause');
const mongoose = require('mongoose');

// add product
exports.addProduct = BigPromise(async (req, res, next) => {
    const { name, price, description, category, stock, brand } = req.body;

    // any field is missing
    if (!(name && price && description && category && stock && brand)) {
        return next(CustomError(res, 'All Fields Are Mandatory!', 400));
    }

    // product is already in db
    const productDB = await Product.findOne({ name });

    if (productDB) {
        return next(CustomError(res, 'Product Name Already Exists', 400));
    }

    // no photo is passed
    if (!req.files) {
        return next(CustomError(res, 'Photo is required', 401));
    }

    // upload photo
    let imagesArray = [];

    for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.uploader.upload(
            req.files.photos[index].tempFilePath,
            {
                folder: 'ecommerce',
            },
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
});

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
    const productObj = new WhereClause(Product.find(), req.query)
        .search()
        .filter();

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
    });
});

// get all products admin
exports.getAllProducts = BigPromise(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

// get single product
exports.getSingleProduct = BigPromise(async (req, res, next) => {
    const productId = req.params.id;

    // product is is not passed
    if (!productId) {
        return next(CustomError(res, 'Product Id Is Required!', 401));
    }

    // if not bson
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(CustomError(res, 'Product Id not valid!', 400));
    }

    // find all data
    const product = await Product.findById(productId);

    // no product found
    if (!product) {
        return next(CustomError(res, 'No Product Found!', 401));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

// update information of product
exports.adminUpdateProductInfo = BigPromise(async (req, res, next) => {
    const productId = req.params.id;

    // id not passed
    if (!productId) {
        return next(CustomError(res, 'Product ID Is Required!', 401));
    }

    // if not bson
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(CustomError(res, 'Product Id not valid!', 400));
    }

    let product = await Product.findById(productId);

    // product not found in db
    if (!product) {
        return next(CustomError(res, 'Product Not Found', 400));
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
                    folder: 'ecommerce',
                },
            );

            imagesArray.push({
                id: imageUpload.public_id,
                secure_url: imageUpload.secure_url,
            });
        }
    }

    // update user in body
    if (imagesArray.length > 0) {
        // image array is not empty
        req.body.photos = imagesArray;
        console.log('image Array');
    }

    req.body.user = req.user.id;

    // update product
    product = await Product.findByIdAndUpdate(productId, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

// admin delete product
exports.adminDeleteProduct = BigPromise(async (req, res, next) => {
    const productId = req.params.id;

    if (!productId) {
        return next(CustomError(res, 'Product ID Is Required!', 401));
    }

    // if not bson
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(CustomError(res, 'Product Id not valid!', 400));
    }

    const product = await Product.findById(productId);

    // product id is invalid
    if (!product) {
        return next(CustomError(res, 'Product Not Found!', 400));
    }

    // delete all photos of product
    const existingPhotos = product.photos;
    for (let index = 0; index < existingPhotos.length; index++) {
        await cloudinary.uploader.destroy(existingPhotos[index].id);
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: 'Product Deleted Successfully!',
    });
});

// add review on product - if review change the review
exports.addReview = BigPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    // all fields required
    if (!(rating && comment && productId)) {
        return next(CustomError(res, 'All Fields Are Required!', 400));
    }

    const product = await Product.findById(productId);

    // productID is invalid
    if (!product) {
        return next(CustomError(res, 'Product Not Found!', 400));
    }

    //  reiew of user
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    // check if user already added
    const AlreadyCommented = product.reviews.find(
        (item) => item.user.toString() === req.user._id.toString(),
    );

    //     // if review already exits by user
    if (AlreadyCommented) {
        product.reviews.forEach((item) => {
            if (item.user.toString() === req.user._id.toString()) {
                item.rating = rating;
                item.comment = comment;
            }
        });
    } else {
        // if user havent given any review
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length;
    }

    // change average rating
    product.rating =
        product.reviews.reduce(
            (previousItem, currentItem) => currentItem.rating + previousItem,
            0,
        ) / product.reviews.length;

    // save user model
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// delete a review
exports.deleteReview = BigPromise(async (req, res, next) => {
    const productId = req.query.id;

    if (!productId) {
        return next(CustomError(res, 'All Fields Are Mandatory!', 400));
    }

    let product = await Product.findById(productId);

    if (!product) {
        return next(CustomError(res, 'Product Not Found!', 400));
    }

    // new review array with deleted user review
    const reviews = product.reviews.filter(
        (item) => item.user.toString() !== req.user._id.toString(),
    );

    const numberOfReviews = reviews.length;

    // average rating
    const rating =
        numberOfReviews > 0
            ? reviews.reduce(
                  (previousItem, currentItem) =>
                      previousItem + currentItem.rating,
                  0,
              ) / numberOfReviews
            : 0;

    // update the product
    product = await Product.findByIdAndUpdate(
        productId,
        {
            rating,
            numberOfReviews,
            reviews,
        },
        {
            new: true,
            runValidators: true,
        },
    );

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// send all the review of product
exports.getSingleProductReviews = BigPromise(async (req, res, next) => {
    const productId = req.query.id;

    // product id not passed
    if (!productId) {
        return next(CustomError(res, 'All Fields Are Mandatory!', 400));
    }

    const product = await Product.findById(productId);

    // product not found
    if (!product) {
        return next(CustomError(res, 'Product Not Found', 400));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});
