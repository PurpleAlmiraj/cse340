const utilities = require("../utilities/");
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    req.flash("notice", "This is a flash message.");
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
}

/* ****************************************
*  Deliver register view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    req.flash("notice", "This is a flash message.");
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
}


/* ****************************************
*  Deliver account view
* *************************************** */
async function getAccountManagementView(req, res, next) {
  let nav = await utilities.getNav();
  req.flash("notice", "This is a flash message.");
  res.render("account/management", {
    title: "Management Inventory",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hashSync(account_password, 10);
    
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
 *  Process logout request
 * ************************************ */
 async function accountLogout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
 }

 /* ****************************************
 *  Process edit view
 * ************************************ */
async function editLoginInfo(req, res) {
  let nav = await utilities.getNav()
  account_id = req.params.account_id
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/edit-account", {
    title: "Edit Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

 /* ****************************************
 *  Process update information request
 * ************************************ */
 async function editAccount(req, res) {
  let nav = await utilities.getNav();
  const account_id = req.params.account_id;
  const accountData = await accountModel.getAccountById(account_id);
  res.render("account/edit-account", {
    title: "Edit Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  });
}

async function updateAccountInformation(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  const accountData = await accountModel.getAccountById(account_id);

  try {
    // Check if the email is being updated and ensure it's not already in use
    const existingEmail = await accountModel.checkExistingEmail(account_email);
    if (existingEmail && existingEmail.account_id !== account_id) {
      req.flash("notice", "Email address is already in use.");
      return res.status(400).render("account/edit-account", {
        title: "Edit Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      });
    }

    // Proceed with updating account information
    const updateInformation = await accountModel.updateInformation(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    );

    if (updateInformation) {
      req.flash(
        "notice",
        `Congratulations, ${account_firstname}. You have updated your account.`
      );

      // Clear old token and set new token with updated information
      res.clearCookie("jwt");
      const updatedInformation = await accountModel.getAccountById(account_id);
      delete updatedInformation.account_password;
      const accessToken = jwt.sign(
        updatedInformation,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      res.status(201).redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the account update failed.");
      res.status(501).render("account/edit-account", {
        title: "Edit Account",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
      });
    }
  } catch (error) {
    req.flash("notice", "Failed to update account information.");
    res.status(500).render("account/edit-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

 /* ****************************************
 *  Process login request
 * ************************************ */
 async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;
  const accountData = await accountModel.getAccountById(account_id);

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hashSync(account_password, 10);

    // Proceed with updating password
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Congratulations, your password has been updated.");
      res.status(201).render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, the password update failed.");
      res.status(501).render("account/edit-account", {
        title: "Edit Account",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
      });
    }
  } catch (error) {
    req.flash("notice", "Failed to update password.");
    res.status(500).render("account/edit-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  getAccountManagementView,
  accountLogin,
  accountLogout,
  editAccount,
  updateAccountInformation,
  changePassword,
};