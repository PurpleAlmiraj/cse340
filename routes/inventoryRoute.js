const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/utilities");
const invModel = require("../models/inventory-model"); 
const { invCont, errormess } = require("../controllers/invController");

// Route to management view
router.get("/", async (req, res, next) => { 
    try {
        console.log("Accessing management view");
        const managementData = await invModel.getManagementData();
        console.log("Management data:", managementData);
        let nav = await utilities.getNav();
        res.render("./inventory/management", {
            title: "Inventory Management",
            nav,
            managementData,
        });
    } catch (error) {
        console.error("Error rendering management view:", error);
        next(error);
    }
});

// Route to render add-classification view
router.get("/add-classification", utilities.handleErrors(invCont.renderAddClassificationView));

// Route to handle form submission for adding a new classification
router.post("/add-classification", utilities.handleErrors(invCont.addNewClassification));

// Route to render add inventory view
router.get("/add-inventory", utilities.handleErrors(invCont.renderAddInventoryView));

// Route to handle form submission for adding a new inventory
router.post("/add-inventory", utilities.handleErrors(invCont.addNewInventory));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId));

// Route to build single view
router.get("/detail/:inventoryId", utilities.handleErrors(invCont.buildByInventoryId));

// Intentional Error Route
router.get("/trigger-error", utilities.handleErrors(errormess.buildError));

module.exports = router;
