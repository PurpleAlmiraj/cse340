const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle, index) => { 
      const row = Math.floor(index / 2) + 1
      const col = index % 2 + 1
      grid += '<li style="grid-column: ' + col + '; grid-row: ' + row + ';">'
      grid += '<div class="namePrice">'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<p><strong>Year:</strong> ' + vehicle.inv_year + '</p>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="vehicle-info">'
      grid += '<p><strong>Mileage:</strong> ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + ' miles</p>'
      grid += '<p><strong>Description:</strong> ' + vehicle.inv_description + '</p>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the item view HTML
 * ************************************ */
Util.buildItemGrid = async function(data) {
  let grid
  if (data != null) {
    grid = '<div id="vehicle-display">'
    grid += '<img id="vehicle-img" src="' + data.inv_image + ' "alt="Image of '+ data.inv_make + ' ' + data.inv_model 
        +' on CSE Motors" />'
    grid += '<h2 id="vehicle-title">' + data.inv_make + ' ' + data.inv_model + ' Details'
    grid += '<h3 id="vehicle-price">Price: $' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</h3>'
    grid += '<div id="vehicle-description"><h3>Description: </h3><p>' + data.inv_description + '</p></div>'
    grid += '<div id="vehicle-color"><h3>Color: </h3><p>' + data.inv_color + '</p></div>' 
    grid += '<div id="vehicle-miles"><h3>Miles: </h3><p>' + new Intl.NumberFormat('en-US').format(data.inv_miles) + '</p></div>'
    grid += '</div>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicle could be found.</p>'
  }
  return grid
}

module.exports = Util
