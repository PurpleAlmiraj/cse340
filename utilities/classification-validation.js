const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/* ******************************
 * Classification Rules
 * ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .isAlphanumeric()
      .withMessage(
        "Please provide a classification name that meets the requirements."
      ),
  ];
};

/* ******************************
 * Check classification name
 * ***************************** */
validate.checkClassificationName = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  let nav = await utilities.getNav();
  if (!errors.isEmpty()) {
    console.log(errors);
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/* ******************************
 * Inventory Rules
 * ***************************** */
validate.inventoryRules = () => {
    return [
      body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .isAlphanumeric()
        .withMessage("Please provide a make that meets the requirements."),
      body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        // .withMessage("Empty field.")
        .isLength({ min: 2 })
        .isAlphanumeric()
        .withMessage("Please provide a model that meets the requirements."),
      body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 4, max: 4 })
        .isNumeric()
        .withMessage("Please provide a year that meets the requirements."),
      body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a make that meets the requirements."),
      body("inv_image")
        .trim()
        .notEmpty()
        .isLength({ min: 2 })
        //   .isURL()
        .withMessage("Please provide an image that meets the requirements."),
      body("inv_thumbnail")
        .trim()
        .notEmpty()
        .isLength({ min: 2 })
        //   .isURL()
        .withMessage("Please provide a thumbnail that meets the requirements."),
      body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .withMessage("Please provide a price that meets the requirements."),
      body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .withMessage("Please provide miles that meet the requirements."),
      body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .isAlphanumeric()
        .withMessage("Please provide a color that meet the requirements."),
      body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .withMessage(
          "Please provide a classification id that meets the requirements."
        ),
    ];
  };

/* ******************************
 * Check data and return errors or continue to add vehicle
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  let errors = []
  const dropdown = await utilities.buildClassificationList(classification_id)
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      dropdown,
      errors,
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or return to edit vehicle page
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  let errors = []
  const dropdown = await utilities.buildClassificationList(classification_id)
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/edit-inventory", {
      title: "Edit Vehicle",
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      dropdown,
      errors,
    })
    return
  }
  next()
}

module.exports = validate;