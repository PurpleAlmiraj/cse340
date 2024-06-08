const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inventoryId", invController.buildByInventoryId);

router.get('/trigger-error', errorController.triggerError);

module.exports = router;
