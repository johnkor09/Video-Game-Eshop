const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'so_long_gay_bowesr_67';

// Middleware για απλούς συνδεδεμένους χρήστες
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Αποθηκεύουμε τα στοιχεία του χρήστη στο request
        next(); // Συνεχίζουμε στον επόμενο handler (Controller)
    } catch (ex) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware για ελέγχους Admin
const checkAuthAndAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // ΑΛΛΑΓΗ ΕΔΩ: Ελέγχουμε το decoded.role, γιατί έτσι το έστειλες στο login!
        // Πρόσθεσα και το "=== true" για σιγουριά, αν η βάση το επιστρέφει ως boolean.
        if (decoded.admin_status === 1 || decoded.admin_status === true) {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({ message: 'Forbidden. Admin access required.' });
        }
    } catch (ex) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = { authenticateToken, checkAuthAndAdmin };