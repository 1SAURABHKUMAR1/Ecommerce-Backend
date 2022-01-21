// custom error to store message and status code
const CustomError = (res, message, statusCode) => {
    res.status(statusCode).json({
        success: false,
        message: message,
    })
};

module.exports = CustomError;