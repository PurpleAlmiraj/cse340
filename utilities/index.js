const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
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

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors"></a>'
        grid += '<div class="namePrice">'
        grid += '<hr>'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
 * Build the item view HTML
 * ************************************ */
Util.buildItemGrid = async function(data, reviews = []) {
  let grid = '<div class="vehicle-display">';

  if (data != null) {
    grid += `
      <div class="vehicle-image">
        <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model} on CSE Motors">
      </div>
      <div class="vehicle-info">
        <h2>${data.inv_make} ${data.inv_model} Details</h2>
        <h3>Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</h3>
        <div class="vehicle-description">
          <h3>Description:</h3>
          <p>${data.inv_description}</p>
        </div>
        <div class="vehicle-color">
          <h3>Color:</h3>
          <p>${data.inv_color}</p>
        </div>
        <div class="vehicle-miles">
          <h3>Miles:</h3>
          <p>${new Intl.NumberFormat('en-US').format(data.inv_miles)}</p>
        </div>
        <div class="vehicle-year">
          <h3>Year:</h3>
          <p>${data.inv_year}</p>
        </div>
        <div class="review-button">
          <a href="/account/create-review?inv_id=<%= data.inv_id %>" class="btn-review">Write a Review</a>
        </div>
      </div>
    `;

    if (reviews.length > 0) {
      grid += `
        <div class="reviews-section">
          <h3>Reviews:</h3>
          ${reviews.map(review => `
            <div class="review-item">
              <p><strong>Date:</strong> ${review.review_date}</p>
              <p>${review.review_text}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  } else {
    grid += '<p class="notice">Sorry, no matching vehicle could be found.</p>';
  }

  grid += '</div>';
  return grid;
};

/* **************************************
 * Build the classification list view HTML
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 *  Check if admin or employee
 * ************************************ */
Util.checkEmployeeStatus = (req, res, next) => {
  if (res.locals.loggedin) {
    const account_type = res.locals.accountData.account_type
    if (account_type == "Admin" || account_type == "Employee") {
      next()
    } else {
      req.flash(
        "notice",
        "You do not have the ability to access this page."
      )
      res.redirect("account/login")
    }
  } else {
    req.flash(
      "notice",
      "You do not have the ability to access this page."
    )
    res.redirect("account/login")
  }
}

/* ****************************************
 * Build review
 **************************************** */
Util.buildReviews = async function (data) {
  let reviews = "<ul class='reviews'>";

  for (const review of data) {
    let accountData = await accountModel.getAccountById(review.account_id);
    let screenName = accountData.account_firstname[0] + ' ' + accountData.account_lastname;
    let formattedDate = review.review_date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    reviews += "<li>";
    reviews += "<h3>" + screenName + " wrote on " + formattedDate + "</h3>";
    reviews += "<p id='clientreview'>" + review.review_text + "</p>";
    reviews += "</li>";
  }

  reviews += "</ul>";
  return reviews;
};

/* ****************************************
 * Build client/manage review
 **************************************** */
Util.buildClientReviews = async function (reviewsData, res) {
  let reviews = "<ul class='reviewList'>";
  for (const review of reviewsData) {
    let accountData = res.locals.accountData;
    let screenName =
      accountData.account_firstname[0] +
      " " +
      accountData.account_lastname;
    let formattedDate = review.review_date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    reviews += "<li>";
    reviews += `<h3>${screenName} reviewed the ${review.inv_year} ${review.inv_make} ${review.inv_model} on ${formattedDate}</h3>`;
    reviews += `<a href="/account/edit-review/${review.review_id}">| Edit |</a>`;
    reviews += `<a href="/account/delete-review/${review.review_id}"> Delete | </a>`;
    reviews += "</li>";
  }
  
  reviews += "</ul>";
  return reviews;
}
module.exports = Util