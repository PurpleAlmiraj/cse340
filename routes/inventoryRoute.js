const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const { invCont, errormess } = require("../controllers/invController");
const invValidate = require("../utilities/classification-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", 
    utilities.handleErrors(invCont.buildByClassificationId));

// Route to build single view
router.get("/detail/:inventoryId", 
    utilities.handleErrors(invCont.buildByInventoryId));

// Route for management view
router.get("/", 
    utilities.checkEmployeeStatus,
    utilities.handleErrors(invCont.management));

// Route for add classification view
router.get("/add-classification", 
    utilities.checkEmployeeStatus,
    utilities.handleErrors(invCont.newclassification));

router.post("/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationName,
    utilities.handleErrors(invCont.processclassification));

// Route for add inventory view
router.get("/add-inventory", 
    utilities.checkEmployeeStatus,
    utilities.handleErrors(invCont.addinventory));

router.post("/add-inventory", 
    utilities.handleErrors(invCont.processInventory));

// Intentional Error Route
router.get("/trigger-error", 
    utilities.handleErrors(errormess.buildError));

// Process route and return data as JSON
router.get("/getInventory/:classification_id", 
    invValidate.inventoryRules(),
    utilities.handleErrors(invCont.getInventoryJSON));

// Route to show edit page view
router.get("/edit/:inv_id",
    utilities.checkEmployeeStatus,
    utilities.handleErrors(invCont.showeditpage));

router.post("/update-vehicle", 
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invCont.updateInventory));

//Route to show delete view
router.get("/delete/:inv_id",
    utilities.checkEmployeeStatus,
    utilities.handleErrors(invCont.showdeletepage));

router.post("/delete-vehicle",
    utilities.handleErrors(invCont.processdelete));

module.exports = router;