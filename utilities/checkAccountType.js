// utilities/checkAccountType.js

const jwt = require('jsonwebtoken');
const { getUserById } = require('../utilities/userFunctions'); // Assuming you have a function to fetch user details

const checkAccountType = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Assuming JWT is stored in a cookie
        if (!token) {
            return res.status(401).redirect('/account/login'); // Redirect to login if token is missing
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Fetch user details from database
        const user = await getUserById(userId); // Implement this function to fetch user details

        if (!user || (user.accountType !== 'Employee' && user.accountType !== 'Admin')) {
            return res.status(403).render('account/login', { message: 'Unauthorized access' });
        }

        // Set user information in locals for use in views if needed
        res.locals.user = user;

        next();
    } catch (error) {
        console.error('Error in account type verification middleware:', error);
        return res.status(500).render('errors/error', { title: 'Server Error', message: 'Internal Server Error' });
    }
};

module.exports = checkAccountType;
