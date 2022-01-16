// dependencies
const express = require("express");
const router = express.Router();

// import controller
const { home } = require("../controllers/homeController")

// send router to controller
router.route("/").get(home);

// export routes
module.exports = router;