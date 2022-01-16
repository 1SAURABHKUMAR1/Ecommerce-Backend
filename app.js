// import dependencies
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require('morgan');
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const ejs = require("ejs");


// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// regular middlware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ejs middlware
app.set("view engine", "ejs");


// cookie and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));


// morgan middleware
app.use(morgan('tiny'))


// import all routes
const home = require("./routes/home");
const user = require("./routes/user");


// router middleware 
app.use("/api/v1", home);
app.use("/api/v1", user);


// route to serve ejs // TODO:



// export app js
module.exports = app;