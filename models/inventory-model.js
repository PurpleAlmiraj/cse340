const pool = require("../database/");

// Get all classification data
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

// Get all inventory items and classification_name by classification_id
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
            JOIN public.classification AS c 
            ON i.classification_id = c.classification_id 
            WHERE i.classification_id = $1`,
            [classification_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByClassificationId error: ", error);
    }
}

// Get single view by item ID
async function getInventoryByID(inventory_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory
            WHERE inv_id = $1`,
            [inventory_id]
        );
        return data.rows[0];
    } catch (error) {
        console.error("Error getting inventory item by ID: ", error);
    }
}

// Add new classification to the database

async function addNewClassification(classification_name) {
    try {
        await pool.query("INSERT INTO classification (classification_name) VALUES ($1)", [classification_name]);
    } catch (error) {
        console.error("Error adding new classification: ", error);
        throw error;
    }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByID, addNewClassification };
