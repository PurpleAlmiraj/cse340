const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const { invCont, errormess } = require("../controllers/invController"); 



// Route to render add-classification view
router.get("/add-classification", (req, res) => {
    res.render("inventory/add-classification", { title: "Add New Classification" });
});

// Route to handle form submission for adding a new classification
router.post("/add-classification", 
    utilities.handleErrors(invCont.addNewClassification)
);

// Route to render add inventory view
router.get("/add", utilities.handleErrors(invCont.renderAddInventoryView));
// Route to management view
router.get("/", utilities.handleErrors(invCont.renderManagementView));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId));

// Route to build single view
router.get("/detail/:inventoryId", utilities.handleErrors(invCont.buildByInventoryId));

// Intentional Error Route
router.get("/trigger-error", utilities.handleErrors(errormess.buildError));

module.exports = router;
