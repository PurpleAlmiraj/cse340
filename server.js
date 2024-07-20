/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const path = require('path'); // Ensure this is at the top
const express = require('express');
const session = require('express-session');
const pool = require('./database/');
const expressLayouts = require('express-ejs-layouts');
const env = require('dotenv').config();
const app = express();
const static = require('./routes/static');
const baseController = require('./controllers/baseController');
const inventoryRoute = require('./routes/inventoryRoute');
const utilities = require('./utilities/');
const accountRoute = require('./routes/accountRoute');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

/* ***********************
 * Middleware
 *************************/
app.use(express.static(path.join(__dirname, 'public'))); // Serving static files

app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser()); // For handling cookies

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(utilities.checkJWTToken); // Custom middleware for JWT token checking

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static); // Static routes
app.get("/", utilities.handleErrors(baseController.buildHome)); // Home route
app.use("/inv", inventoryRoute); // Inventory routes
app.use("/account", accountRoute); // Account routes

/* ***********************
 * Error Handlers
 *************************/
app.use(async (req, res, next) => {
  next({ status: 500, message: "This is intentional." });
});

app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(404).render("errors/error", {
    title: err.status || 'Server Error',
    message: "Sorry, we have lost the page.",
    nav
  });
});

app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(500).render("errors/error", {
    title: "Muahahaha",
    message: "You have encountered a 500 error!",
    nav
  });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});
