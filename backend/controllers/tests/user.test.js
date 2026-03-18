const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../../config/db');
const db = require('../../models/index')(sequelize);
const User = db.User;
const app = require('../../server');

const JWT_SECRET = process.env.JWT_SECRET || 'so_long_gay_bowesr_67';

describe('User Controller - Integration Tests', () => {
    let adminToken, userToken, adminId, userId;

    beforeAll(async () => {
        // Συγχρονισμός βάσης
        await sequelize.sync({ force: true });

        // 1. Δημιουργία Admin
        const admin = await User.create({
            first_name: 'Jane',
            surname: 'Smith',
            email: 'admin@example.com',
            password_: 'hashed_pass_2',
            admin_status: 1
        });
        adminId = admin.user_id;
        // Φτιάχνουμε token που να ταιριάζει με το payload του Login controller μας
        adminToken = jwt.sign({ id: admin.user_id, admin_status: 1 }, JWT_SECRET);

        // 2. Δημιουργία απλού χρήστη
        const user = await User.create({
            first_name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
            password_: 'hashed_pass_1',
            admin_status: 0
        });
        userId = user.user_id;
        userToken = jwt.sign({ id: user.user_id, admin_status: 0 }, JWT_SECRET);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TEST 1: GetAllCustomers (Admin Only) ---
    describe('GET /api/users', () => {
        it('Θα πρέπει να επιστρέψει 200 αν ο αιτών είναι Admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`); // Στέλνουμε το Admin Token

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
        });

        it('Θα πρέπει να επιστρέψει 403 αν ο αιτών είναι απλός χρήστης', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${userToken}`); // Στέλνουμε απλό User Token

            expect(res.statusCode).toBe(403);
        });
    });

    // --- TEST 2: GetUserProfile ---
    describe('GET /api/users/profile', () => {
        it('Θα πρέπει να επιστρέψει το προφίλ του σωστού χρήστη', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe('john@example.com');
            expect(res.body.user_id).toBe(userId);
        });
    });

    // --- TEST 3: UpdateUserProfile ---
    describe('PUT /api/users/profile', () => {
        it('Θα πρέπει να ενημερώσει το όνομα του χρήστη', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    first_name: 'John-Updated',
                    surname: 'Doe-Updated'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Profile updated successfully");

            // Επιβεβαίωση στη βάση
            const updatedUser = await User.findByPk(userId);
            expect(updatedUser.first_name).toBe('John-Updated');
        });
    });
});