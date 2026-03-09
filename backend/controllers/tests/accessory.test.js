const request = require('supertest');
const { sequelize } = require('../../config/db');
const db = require('../../models/index')(sequelize);

// 1. Παίρνουμε τα μοντέλα κανονικά
const Product = db.Product;
const Accessory = db.Accessory;

// 2. Κάνουμε require το app ΜΕΤΑ τα μοντέλα
const app = require('../../server');

describe('Accessory Controller Integration Tests', () => {
    
    beforeAll(async () => {
        // Καθαρισμός και συγχρονισμός
        await sequelize.sync({ force: true });
        
        // Δημιουργία δεδομένων - Τώρα το .create() θα δουλεύει κανονικά
        await Product.create({
            product_id: 1,
            title: 'Cool Hat',
            price: 20.00,
            is_active: 1,
            product_type: 'accessory'
        });
        await Accessory.create({ product_id: 1, accessory_type: 'hats' });

        await Product.create({
            product_id: 2,
            title: 'Z-Belt',
            price: 50.00,
            is_active: 1,
            product_type: 'accessory'
        });
        await Accessory.create({ product_id: 2, accessory_type: 'belts' });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('GET /api/accessories/all - Success path', async () => {
        const res = await request(app).get('/api/accessories/all');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('GET /api/accessories/hats - Filter path', async () => {
        const res = await request(app).get('/api/accessories/hats');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].accessory_type).toBe('hats');
    });

    it('GET /api/accessories/all?sortBy=Low-High - Sort path', async () => {
        const res = await request(app).get('/api/accessories/all?sortBy=Low-High');
        expect(res.statusCode).toBe(200);
        expect(Number(res.body[0].price)).toBeLessThan(Number(res.body[1].price));
    });

    it('Θα πρέπει να επιστρέψει 500 αν υπάρχει σφάλμα στη βάση', async () => {
        // 1. Κλείνουμε επίτηδες τη σύνδεση με τη βάση για να αναγκάσουμε το Sequelize να πετάξει error
        await sequelize.close();

        // 2. Κάνουμε το request. Ο controller θα προσπαθήσει να διαβάσει από την κλειστή βάση και θα πετάξει error
        const res = await request(app).get('/api/accessories/all');
        
        // 3. Ελέγχουμε αν το catch block του controller έπιασε το error σωστά
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Database error.');
    });
});