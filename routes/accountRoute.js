const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')


//Route to build account view
router.get("/", 
    utilities.checkLogin, 
    utilities.handleErrors(accountController.getAccountManagementView))

// Route to build inventory by classification view
router.get("/login", 
    utilities.handleErrors(accountController.buildLogin));

//Route to build registration view
router.get("/register", 
    utilities.handleErrors(accountController.buildRegister))

//Process registration data
router.post("/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post("/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin))

//Process logout attempt
router.get("/logout",
    utilities.handleErrors(accountController.accountLogout))

// Process account edit view
router.get("/edit-account/:account_id", 
    utilities.handleErrors(accountController.editLoginInfo))

// Process account edit account data
router.post("/edit-information", 
  regValidate.registrationRules(),
  utilities.handleErrors(accountController.editinformation))

// Process account edit password
router.post("/edit-password",
  regValidate.loginRules(),
  utilities.handleErrors(accountController.editPassword))

module.exports = router;