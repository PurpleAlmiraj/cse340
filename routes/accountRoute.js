const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

//Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//Process registration data
router.post(
    "/register", 
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
)

router.post(
    "/register",
    (req, res) => {
      res.status(200).send('login process')
    }
)

module.exports = router;