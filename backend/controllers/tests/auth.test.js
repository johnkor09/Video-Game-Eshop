// 1. Mock της Βάσης (Config & Models)
jest.mock('../../config/db', () => ({
    sequelize: {}
}));

jest.mock('../../models/index', () => {
    const mockDbInstance = {
        User: {
            findOne: jest.fn(),
            create: jest.fn()
        }
    };
    return () => mockDbInstance;
});

// 2. Mock των εξωτερικών βιβλιοθηκών (bcrypt & jwt)
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../models/index')();
const authController = require('../AuthController'); // Βεβαιώσου ότι το path είναι σωστό



describe('Auth Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        // Προετοιμασία των Request και Response
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        // Σιγάζουμε τα error logs για καθαρό terminal στα 500 errors
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    // --- 1. SIGNUP TESTS ---
    describe('Signup', () => {
        it('Θα πρέπει να επιστρέψει σφάλμα αν το email υπάρχει ήδη', async () => {
            req.body = { email: 'test@test.com' };
            // Κάνουμε τη βάση να "βρει" τον χρήστη
            db.User.findOne.mockResolvedValue({ email: 'test@test.com' });

            await authController.signup(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Email already in use!"
            });
            expect(db.User.create).not.toHaveBeenCalled();
        });

        it('Θα πρέπει να δημιουργήσει νέο χρήστη και να επιστρέψει token', async () => {
            req.body = { name: 'John', surname: 'Doe', email: 'new@test.com', pass1: 'password123' };
            
            // Η βάση ΔΕΝ βρίσκει τον χρήστη (άρα είναι νέος)
            db.User.findOne.mockResolvedValue(null);
            
            // Κάνουμε mock το hashing και τη δημιουργία χρήστη
            bcrypt.hash.mockResolvedValue('hashed_password');
            db.User.create.mockResolvedValue({
                user_id: 1,
                first_name: 'John', // Πρόσεξε: Εδώ βάλαμε το first_name όπως στη βάση
                email: 'new@test.com',
                admin_status: 0
            });
            
            // Κάνουμε mock το token
            jwt.sign.mockReturnValue('fake_jwt_token');

            await authController.signup(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(db.User.create).toHaveBeenCalled();
            expect(jwt.sign).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                token: 'fake_jwt_token'
            }));
        });
    });

    // --- 2. LOGIN TESTS ---
    describe('Login', () => {
        it('Θα πρέπει να επιστρέψει 401 αν ο χρήστης δεν υπάρχει', async () => {
            req.body = { email: 'wrong@test.com', password: '123' };
            db.User.findOne.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Wrong email or password."
            });
        });

        it('Θα πρέπει να επιστρέψει 401 αν ο κωδικός είναι λάθος', async () => {
            req.body = { email: 'user@test.com', password: 'wrong_password' };
            
            // Ο χρήστης υπάρχει
            db.User.findOne.mockResolvedValue({ password_: 'hashed_db_password' });
            
            // Όμως το bcrypt.compare λέει ότι ο κωδικός ΔΕΝ ταιριάζει
            bcrypt.compare.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Wrong email or password."
            });
        });

        it('Θα πρέπει να κάνει login και να επιστρέψει token αν όλα είναι σωστά', async () => {
            req.body = { email: 'user@test.com', password: 'correct_password' };
            
            // Ο χρήστης υπάρχει
            db.User.findOne.mockResolvedValue({
                user_id: 2,
                first_name: 'Jane',
                email: 'user@test.com',
                admin_status: 1,
                password_: 'hashed_db_password'
            });
            
            // Το bcrypt λέει ότι ο κωδικός είναι σωστός
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('valid_login_token');

            await authController.login(req, res);

            expect(bcrypt.compare).toHaveBeenCalledWith('correct_password', 'hashed_db_password');
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                token: 'valid_login_token'
            }));
        });

        it('Θα πρέπει να επιστρέψει 500 αν η βάση κρασάρει', async () => {
            req.body = { email: 'error@test.com' };
            db.User.findOne.mockRejectedValue(new Error('DB Boom!'));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Database error');
        });
    });
});