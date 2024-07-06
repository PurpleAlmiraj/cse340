const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};
const errormess = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Build single view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId;
  const data = await invModel.getInventoryByID(inventory_id);
  const grid = await utilities.buildItemGrid(data);
  let nav = await utilities.getNav();
  res.render("./inventory/detail", {
    title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Show management view
 * ************************** */
invCont.management = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  req.flash("notice", "This is a flash message.");
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
  });
};

/* ***************************
 *  Show add classification view
 * ************************** */
invCont.newClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  req.flash("notice", "This is a flash message.");
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 * Process New Classification to database
 * ************************** */
invCont.processClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const addResult = await invModel.addclassification(classification_name);
  if (addResult) {
    req.flash("info success", `${classification_name} added successfully.`);
    res.status(201).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    });
  } else {
    req.flash("notice", "Sorry, the classification failed.");
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    });
  }
};

/* ***************************
 *  Show add inventory view
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const dropdown = await utilities.buildClassificationList();
  req.flash("notice", "This is a flash message.");
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    dropdown,
    errors: null,
  });
};

/* ***************************
 * Process add inventory form submission
 * ************************** */
invCont.processInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  let nav = await utilities.getNav();

  const inventoryResult = await invModel.addinventory(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  );
  const classification = await invModel.addclassification();

  let dropdown = await utilities.buildClassificationList(classification);

  if (inventoryResult) {
    req.flash("notice", `Inventory ${inv_make} ${inv_model} added.`);
    res.status(201).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      dropdown,
    });
  } else {
    req.flash("notice", "Sorry, the inventory failed.");
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      dropdown,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.showEditPage = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByID(inv_id);
  const dropdown = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: `Edit ${itemName}`,
    nav,
    dropdown,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ***************************
 * Update Vehicle Info
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();

  const {
    inv_id,
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
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const dropdown = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("./inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      dropdown,
      errors: null,
      inv_id,
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
    });
  }
};

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.showDeletePage = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByID(inv_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: `Delete ${itemName}`,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  });
};

/* ***************************
 * Process delete from database
 * ************************** */
invCont.processDelete = async function (req, res, next) {
  let nav = await utilities.getNav();

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
  } = req.body;

  const deleteResult = await invModel.processDelete(inv_id);

  if (deleteResult) {
    req.flash(
      "alert success",
      `${inv_year} ${inv_make} ${inv_model} successfully deleted.`
    );
    res.redirect("/inv/");
  } else {
    req.flash("alert error", "Sorry, the vehicle was not deleted.");
    res.redirect("/inv/delete/" + inv_id);
  }
};

// Build Error
errormess.buildError = (req, res, next) => {
  throw new Error("Intentional error occurred");
};

module.exports = { invCont, errormess };
