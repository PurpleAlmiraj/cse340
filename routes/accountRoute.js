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
  regValidate.passwordRules(),
  utilities.handleErrors(accountController.editPassword))

// Build review edit view
router.get("/edit-review/:review_id", 
    utilities.handleErrors(accountController.buildEditReview))

// Process review edit
router.post("/edit-review",
  regValidate.reviewRules(),
  utilities.handleErrors(accountController.editReview))

// Build review delete view
router.get("/delete-review/:review_id", 
    utilities.handleErrors(accountController.buildDeleteReview))

// Process review delete
router.post("/delete-review", 
    utilities.handleErrors(accountController.deleteReview))

module.exports = router;