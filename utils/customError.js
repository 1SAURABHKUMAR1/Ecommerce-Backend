// custom error class to store message and status code
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.code = statusCode;
    }
}

// export custom error
module.exports = CustomError;