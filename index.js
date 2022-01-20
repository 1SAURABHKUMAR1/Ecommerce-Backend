// importing dependencies and appjs
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");
const cloudinary = require("cloudinary").v2;


// connect with db
connectDB();


// TODO: cors error


// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})


// PORT address
const { PORT } = process.env;


// listening on port
app.listen(PORT, () => console.log(`Listening on PORT : ${PORT}`));
