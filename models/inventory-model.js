const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
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
    console.error("getInventoryByClassificationId error: " + error);
  }
}

/* ***************************
 *  Get single view by item ID
 * ************************** */
async function getInventoryByID(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
       WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("Error getting inventory item by ID: " + error);
  }
}

/* ***************************
 *  Add new classification to database
 * ************************** */
async function addClassification(classification_name) {
  try {
    const data = await pool.query(
      `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`,
      [classification_name]
    );
    return data.rows[0];
  } catch (error) {
    console.error("addClassification error: " + error);
  }
}

/* ***************************
 *  Add inventory to database
 * ************************** */
async function addInventory(
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
) {
  try {
    const sql = `INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const data = await pool.query(sql, [
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
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("addInventory error: " + error);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `UPDATE public.inventory 
                 SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10 
                 WHERE inv_id = $11 RETURNING *`;
    const data = await pool.query(sql, [
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
      inv_id
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("updateInventory error: " + error);
  }
}

/* ***************************
 *  Delete vehicle
 * ************************** */
async function processDelete(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *';
    const data = await pool.query(sql, [inv_id]);
    return data.rowCount > 0;
  } catch (error) {
    console.error("processDelete error: " + error);
  }
}

/* ***************************
 *  Add review
 * **********************/
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = `INSERT INTO public.review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *`;
    const data = await pool.query(sql, [
      review_text,
      inv_id,
      account_id
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("addReview error: " + error);
  }
}

/* ***************************
 *  Get review by inventory ID
 * **********************/
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `SELECT review.review_text, review.review_date, review.account_id, inventory.inv_make, inventory.inv_model 
                 FROM public.review 
                 JOIN public.inventory ON review.inv_id = inventory.inv_id 
                 WHERE review.inv_id = $1`;
    const data = await pool.query(sql, [inv_id]);
    return data.rows;
  } catch (error) {
    console.error("getReviewsByInventoryId error: " + error);
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByID,
  addInventory,
  addClassification,
  updateInventory,
  processDelete,
  addReview,
  getReviewsByInventoryId
};
