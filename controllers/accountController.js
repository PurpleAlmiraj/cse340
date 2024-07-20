const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const invModel = require("../models/inventory-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
    let reviewdata = await accountModel.getReviewsByAccountId(res.locals.accountData.account_id);
    let review = await utilities.buildClientReviews(reviewdata.rows, res);
    res.render("account/management", {
        title: "Management Inventory",
        nav,
        review,
        errors: null,
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.');
        return res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        });
    }

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
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);

    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.");
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        });
    }

    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password;
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
            const cookieOptions = {
                httpOnly: true,
                maxAge: 3600 * 1000,
            };
            if (process.env.NODE_ENV !== 'development') {
                cookieOptions.secure = true;
            }
            res.cookie("jwt", accessToken, cookieOptions);
            return res.redirect("/account/");
        }
    } catch (error) {
        return next(new Error('Access Forbidden'));
    }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
    res.clearCookie("jwt");
    res.redirect("/");
}

/* ****************************************
 *  Process edit view
 * ************************************ */
async function editLoginInfo(req, res) {
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

/* ****************************************
 *  Process update information request
 * ************************************ */
async function editInformation(req, res, next) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    const updateInformation = await accountModel.updateInformation(account_firstname, account_lastname, account_email, account_id);
    const accountData = await accountModel.getAccountById(account_id);

    if (updateInformation) {
        try {
            delete accountData.account_password;
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

            const cookieOptions = {
                httpOnly: true,
                maxAge: 3600 * 1000,
            };
            if (process.env.NODE_ENV !== 'development') {
                cookieOptions.secure = true;
            }
            res.cookie("jwt", accessToken, cookieOptions);

            req.flash('notice', 'Congratulations, your information has been updated');
            return res.status(201).redirect('/account/');
        } catch (error) {
            return next(new Error('Access Forbidden'));
        }
    } else {
        req.flash('notice', 'Sorry the updating process failed');
        res.status(501).render('account/edit-account', {
            title: 'Edit Account',
            errors: null,
            nav,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email,
        });
    }
}

/* ****************************************
 *  Process password update
 * ************************************ */
async function editPassword(req, res) {
    let nav = await utilities.getNav();
    const { account_id, account_password } = req.body;
    const hashedPassword = bcrypt.hashSync(account_password, 10);

    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
    if (updateResult) {
        const accountData = await accountModel.getAccountById(account_id);
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

        const cookieOptions = {
            httpOnly: true,
            maxAge: 3600 * 1000,
        };
        if (process.env.NODE_ENV !== 'development') {
            cookieOptions.secure = true;
        }
        res.cookie("jwt", accessToken, cookieOptions);

        let reviewdata = await accountModel.getReviewsByAccountId(res.locals.accountData.account_id);
        let review = await utilities.buildClientReviews(reviewdata.rows, res);

        req.flash("notice", "Congratulations, your password has been updated.");
        return res.status(201).render("account/management", {
            title: "Account Management",
            nav,
            review,
            errors: null,
        });
    } else {
        const accountData = await accountModel.getAccountById(account_id);
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
}

/* ****************************************
 *  Build review edit view
 * *************************************** */
async function buildEditReview(req, res) {
    let nav = await utilities.getNav();
    let review_id = req.params.review_id;
    const reviewData = await accountModel.getReviewById(review_id);
    let review = reviewData.rows[0];
    let formattedDate = review.review_date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    let inventory = await invModel.getInventoryByID(review.inv_id);
    res.render("account/edit-review", {
        title: "Edit " + inventory.inv_year + " " + inventory.inv_make + " " + inventory.inv_model + " Review",
        nav,
        review,
        formattedDate,
        errors: null,
    });
}

/* ****************************************
 *  Process review edit
 * *************************************** */
async function editReview(req, res) {
    let nav = await utilities.getNav();
    const { review_id, review_text } = req.body;
    const updateResult = await accountModel.updateReview(review_id, review_text);

    if (updateResult) {
        let reviewsData = await accountModel.getReviewsByAccountId(res.locals.accountData.account_id);
        let review = await utilities.buildClientReviews(reviewsData.rows, res);

        req.flash("notice", "Congratulations, your review has been updated.");
        res.status(201).render("account/management", {
            title: "Account Management",
            nav,
            review,
            errors: null,
        });
    } else {
        const reviewData = await accountModel.getReviewById(review_id);
        let review = reviewData.rows[0];
        let formattedDate = review.review_date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        let inventory = await invModel.getInventoryByID(review.inv_id);

        req.flash("notice", "Sorry, the review update failed.");
        res.status(501).render("account/edit-review", {
            title: "Edit " + inventory.inv_year + " " + inventory.inv_make + " " + inventory.inv_model + " Review",
            nav,
            review,
            formattedDate,
            errors: null,
        });
    }
}

/* ****************************************
 *  Build review delete view
 * *************************************** */
async function buildDeleteReview(req, res) {
    let nav = await utilities.getNav();
    let review_id = req.params.review_id;
    const reviewData = await accountModel.getReviewById(review_id);
    let review = reviewData.rows[0];
    let formattedDate = review.review_date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    let inventory = await invModel.getInventoryByID(review.inv_id);
    res.render("account/delete-review", {
        title: "Delete " + inventory.inv_year + " " + inventory.inv_make + " " + inventory.inv_model + " Review",
        nav,
        review,
        formattedDate,
        errors: null,
    });
}

/* ****************************************
 *  Process review delete
 * *************************************** */
async function deleteReview(req, res) {
    let nav = await utilities.getNav();
    const { review_id } = req.body;
    const deleteResult = await accountModel.deleteReview(review_id);

    if (deleteResult.rowCount) {
        let reviewsData = await accountModel.getReviewsByAccountId(res.locals.accountData.account_id);
        let review = await utilities.buildClientReviews(reviewsData.rows, res);

        req.flash("notice", "Your review has been deleted.");
        res.status(201).render("account/management", {
            title: "Account Management",
            nav,
            review,
            errors: null,
        });
    } else {
        const reviewData = await accountModel.getReviewById(review_id);
        let review = reviewData.rows[0];
        let formattedDate = review.review_date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        let inventory = await invModel.getInventoryByID(review.inv_id);

        req.flash("notice", "Sorry, the review delete failed.");
        res.status(501).render("account/delete-review", {
            title: "Delete " + inventory.inv_year + " " + inventory.inv_make + " " + inventory.inv_model + " Review",
            nav,
            review,
            formattedDate,
            errors: null,
        });
    }
}

/* ****************************************
 *  Build create review view
 * *************************************** */
async function buildCreateReview(req, res) {
    try {
        let nav = await utilities.getNav();
        let inv_id = req.params.inv_id;
        let inventory = await invModel.getInventoryByID(inv_id);

        if (!inventory) {
            return res.status(404).render("404", {
                title: "Not Found",
                nav,
                errors: [{ msg: "Inventory item not found" }],
            });
        }

        res.render("account/create-review", {
            title: `Create Review for ${inventory.inv_year} ${inventory.inv_make} ${inventory.inv_model}`,
            nav,
            inv_id,
            errors: null,
        });
    } catch (error) {
        console.error("Error building create review view:", error);
        res.status(500).render("500", {
            title: "Server Error",
            nav,
            errors: [{ msg: "Server error occurred. Please try again later." }],
        });
    }
}

/* ****************************************
 *  Process review creation
 * *************************************** */
async function createReview(req, res) {
    try {
        let nav = await utilities.getNav();
        const { review_text, inv_id } = req.body;
        const account_id = res.locals.accountData.account_id;
        const createResult = await accountModel.createReview(review_text, inv_id, account_id);

        if (createResult.rowCount) {
            let reviewsData = await accountModel.getReviewsByAccountId(account_id);
            let review = await utilities.buildClientReviews(reviewsData.rows, res);

            req.flash("notice", "Your review has been created.");
            res.status(201).render("account/management", {
                title: "Account Management",
                nav,
                review,
                errors: null,
            });
        } else {
            req.flash("notice", "Sorry, the review creation failed.");
            let inventory = await invModel.getInventoryByID(inv_id);
            res.status(501).render("account/create-review", {
                title: `Create Review for ${inventory.inv_year} ${inventory.inv_make} ${inventory.inv_model}`,
                nav,
                inv_id,
                errors: null,
            });
        }
    } catch (error) {
        console.error("Error creating review:", error);
        req.flash("notice", "Sorry, an error occurred while creating the review.");
        res.status(500).render("500", {
            title: "Server Error",
            nav,
            errors: [{ msg: "Server error occurred. Please try again later." }],
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
    editLoginInfo,
    editInformation,
    editPassword,
    buildEditReview,
    editReview,
    buildDeleteReview,
    deleteReview,
    buildCreateReview,
    createReview,
};
