const invModel = require("../models/inventory-model");
const utilities = require("../utilities/utilities");

const invCont = {};
const errormess = {};

invCont.renderManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const managementData = await invModel.getManagementData(); // Call getManagementData
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      managementData,
      errors: null
    });
  } catch (error) {
    console.error("Error rendering management view:", error);
    next(error);
  }
};

// Render add-classification view
invCont.renderAddClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    });
  } catch (error) {
    console.error("Error rendering add-classification view:", error);
    next(error);
  }
};

// Render add inventory view
invCont.renderAddInventoryView = async function (req, res, next) {
  try {
    const classificationList = await utilities.buildClassificationList();
    let nav = await utilities.getNav();
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null
    });
  } catch (error) {
    console.error("Error rendering add inventory view:", error);
    next(error);
  }
};

// Build inventory by classification view
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

// Build single view
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId;
  const data = await invModel.getInventoryByID(inventory_id);
  const grid = await utilities.buildItemGrid(data);
  let nav = await utilities.getNav();
  res.render("./inventory/detail", {
    title: data.inv_year + ' ' + data.inv_make + ' ' + data.inv_model,
    nav,
    grid,
  });
};

// Add new classification
invCont.addNewClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    await invModel.addNewClassification(classification_name);
    req.flash("success", "New classification added successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding new classification:", error);
    req.flash("error", "Failed to add new classification.");
    res.redirect("/inv/add-classification");
  }
};

errormess.buildError = (req, res, next) => {
  throw new Error("Intentional error occurred");
};

module.exports = { invCont, errormess };
