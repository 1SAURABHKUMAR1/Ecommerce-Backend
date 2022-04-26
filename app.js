require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const cors = require('cors');

// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// regular middlware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ejs middlware
app.set('view engine', 'ejs');

// cors middleware
app.use(cors({ origin: '*' }));

// cookie and file middleware
app.use(cookieParser());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    }),
);

// morgan middleware
app.use(morgan('tiny'));

// import all routes
const home = require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');
const order = require('./routes/order');
const cart = require('./routes/cart');

// router middleware
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', payment);
app.use('/api/v1', order);
app.use('/api/v1', cart);

// route to serve ejs homepage
app.get('/', (req, res) => {
    res.render('homePage');
});

// export app js
module.exports = app;
