const request = require('supertest');
const { sequelize } = require('../../config/db');
const db = require('../../models/index')(sequelize);

const User = db.User;
const app = require('../../server');

describe('User Controller - GetAllCustomers Tests', () => {

    beforeAll(async () => {
        // Καθαρίζουμε και συγχρονίζουμε τη βάση
        await sequelize.sync({ force: true });

        // Δημιουργούμε 2 δοκιμαστικούς χρήστες (έναν απλό και έναν Admin)
        await User.create({
            first_name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
            password_: 'hashed_pass_1',
            admin_status: 0
        });

        await User.create({
            first_name: 'Jane',
            surname: 'Smith',
            email: 'admin@example.com',
            password_: 'hashed_pass_2',
            admin_status: 1
        });
    });

    afterAll(async () => {
        try { await sequelize.close(); } catch (err) {}
    });

    // --- TESTS ---

    it('Θα πρέπει να επιστρέψει 200 και όλους τους πελάτες/χρήστες', async () => {
        // Χτυπάμε απευθείας το base route
        const res = await request(app).get('/api/users');
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        
        // Ελέγχουμε αν τα πεδία επιστρέφονται σωστά
        expect(res.body[0]).toHaveProperty('first_name', 'John');
        expect(res.body[0]).toHaveProperty('email', 'john@example.com');
        expect(res.body[0]).toHaveProperty('admin_status', 0);
        
        expect(res.body[1]).toHaveProperty('first_name', 'Jane');
        expect(res.body[1]).toHaveProperty('admin_status', 1);
    });

    it('Θα πρέπει να επιστρέψει 500 αν υπάρχει σφάλμα στη βάση', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Κλείνουμε τη σύνδεση για να προκαλέσουμε error
        await sequelize.close();

        // Το ίδιο base route και εδώ
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Database error.');

        consoleSpy.mockRestore();
    });
});