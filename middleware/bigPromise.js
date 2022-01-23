// use try catch block || Promise().then().catch() || BigPromise()

const CustomError = require("../utils/customError");

module.exports = func => (req, res, next) =>
    Promise.resolve(func(req, res, next)).catch(error => next(CustomError(res, error.message, 401)))