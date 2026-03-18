// --- 1. Mock της Βάσης ---
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

// --- 2. Mock των βιβλιοθηκών ---
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../models/index')();
const authController = require('../AuthController');

describe('Auth Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { }); 
    });

    describe('Signup', () => {
        it('Θα πρέπει να επιστρέψει σφάλμα αν το email υπάρχει ήδη', async () => {
            req.body = { email: 'test@test.com' };
            db.User.findOne.mockResolvedValue({ email: 'test@test.com' });

            await authController.signup(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Email already in use!"
            });

            // ΔΙΟΡΘΩΣΗ: Αν ο χρήστης υπάρχει, ΔΕΝ πρέπει να καλείται η jwt.sign
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('Θα πρέπει να δημιουργήσει νέο χρήστη με σωστό payload στο token', async () => {
            req.body = { name: 'John', surname: 'Doe', email: 'new@test.com', pass1: 'password123' };
            db.User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed_password');

            // Επιστρέφουμε user_id για να το βρει ο Controller και να φτιάξει το id στο token
            db.User.create.mockResolvedValue({
                user_id: 1,
                first_name: 'John',
                email: 'new@test.com',
                admin_status: 0
            });

            jwt.sign.mockReturnValue('fake_jwt_token');

            await authController.signup(req, res);

            // Έλεγχος αν το jwt.sign κλήθηκε με το σωστό payload (id αντί για user_id)
            expect(jwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    name: 'John',
                    email: 'new@test.com',
                    admin_status: 0
                }),
                expect.any(String),
                expect.any(Object)
            );

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                token: 'fake_jwt_token'
            }));
        });
    });

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

        it('Θα πρέπει να κάνει login επιτυχώς με το νέο payload structure', async () => {
            req.body = { email: 'admin@test.com', password: 'admin_password' };

            db.User.findOne.mockResolvedValue({
                user_id: 10,
                first_name: 'Admin',
                email: 'admin@test.com',
                admin_status: 1,
                password_: 'hashed_db_password'
            });

            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('valid_admin_token');

            await authController.login(req, res);

            // Έλεγχος αν το payload έχει 'id' (από το user_id) και 'admin_status'
            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    id: 10,
                    name: 'Admin',
                    email: 'admin@test.com',
                    admin_status: 1
                },
                expect.any(String),
                expect.any(Object)
            );

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                token: 'valid_admin_token',
                user: expect.objectContaining({ id: 10, admin_status: 1 })
            }));
        });

        it('Θα πρέπει να επιστρέψει 500 αν η βάση κρασάρει', async () => {
            req.body = { email: 'error@test.com' };
            db.User.findOne.mockRejectedValue(new Error('DB Error'));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Database error');
        });
    });
});