const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}
const errormess = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build single view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getInventoryByID(inventory_id)
  const grid = await utilities.buildItemGrid(data)
  let nav = await utilities.getNav()
  res.render("./inventory/detail", {
    title: data.inv_year + ' ' + data.inv_make + ' ' + data.inv_model,
    nav,
    grid,
  })
}

// Build Error
errormess.buildError = (req, res, next) => {
    throw new Error("Intentional error occurred");
};

module.exports = { invCont, errormess };