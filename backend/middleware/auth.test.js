const jwt = require('jsonwebtoken');
const { authenticateToken, checkAuthAndAdmin } = require('./auth'); // Πρόσεξε το path

const JWT_SECRET = process.env.JWT_SECRET || 'so_long_gay_bowesr_67';

describe('Auth Middleware Tests', () => {
    let req, res, next;

    // Πριν από κάθε τεστ, φτιάχνουμε "φρέσκα" mocks
    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('authenticateToken', () => {
        it('θα πρέπει να επιστρέψει 401 αν δεν υπάρχει Authorization header', () => {
            authenticateToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
        });

        it('θα πρέπει να επιστρέψει 401 αν το token είναι άκυρο', () => {
            req.headers.authorization = 'Bearer invalid-token';
            authenticateToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token.' });
        });

        it('θα πρέπει να καλέσει την next() αν το token είναι σωστό', () => {
            const userData = { id: 1, username: 'testuser' };
            const token = jwt.sign(userData, JWT_SECRET);
            
            req.headers.authorization = `Bearer ${token}`;
            authenticateToken(req, res, next);

            expect(req.user).toMatchObject(userData);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('checkAuthAndAdmin', () => {
        it('θα πρέπει να επιστρέψει 403 αν ο χρήστης δεν είναι admin (role !== 1)', () => {
            const userData = { id: 2, role: 0 }; // Απλός χρήστης
            const token = jwt.sign(userData, JWT_SECRET);
            
            req.headers.authorization = `Bearer ${token}`;
            checkAuthAndAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden. Admin access required.' });
        });

        it('θα πρέπει να καλέσει την next() αν ο χρήστης είναι admin (role === 1)', () => {
            const adminData = { id: 1, role: 1 };
            const token = jwt.sign(adminData, JWT_SECRET);
            
            req.headers.authorization = `Bearer ${token}`;
            checkAuthAndAdmin(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toMatchObject(adminData);
        });
    });
});