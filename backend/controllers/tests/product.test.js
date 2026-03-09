const request = require('supertest');
const { sequelize } = require('../../config/db');
const db = require('../../models/index')(sequelize);

const Product = db.Product;
const Game = db.Game;
const Accessory = db.Accessory;
const Collectible = db.Collectible;

const app = require('../../server');



describe('Product Controller - GetSpecificProduct Tests', () => {

    beforeAll(async () => {
        // Καθαρίζουμε και συγχρονίζουμε τη βάση
        await sequelize.sync({ force: true });

        // 1. Δημιουργούμε ένα Game
        await Product.create({
            product_id: 1, title: 'Test Game', price: 50.00, is_active: 1, product_type: 'game'
        });
        await Game.create({ product_id: 1, platform: 'PC', developer: 'Dev', publisher: 'Pub' });

        // 2. Δημιουργούμε ένα Accessory
        await Product.create({
            product_id: 2, title: 'Test Controller', price: 60.00, is_active: 1, product_type: 'accessory'
        });
        await Accessory.create({ product_id: 2, accessory_type: 'gamepad', brand: 'Sony' });

        // 3. Δημιουργούμε ένα Collectible
        await Product.create({
            product_id: 3, title: 'Test Figure', price: 20.00, is_active: 1, product_type: 'collectible'
        });
        await Collectible.create({ product_id: 3, collectible_type: 'figure', brand: 'Funko' });
    });

    afterAll(async () => {
        try { await sequelize.close(); } catch (err) {}
    });

    // --- TESTS ---

    it('Θα πρέπει να επιστρέψει 400 αν το ID δεν είναι αριθμός', async () => {
        const res = await request(app).get('/api/product/invalid_id');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid ID format');
    });

    it('Θα πρέπει να επιστρέψει 404 αν το προϊόν δεν υπάρχει', async () => {
        const res = await request(app).get('/api/product/999');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Game not found.'); // Βάσει του κώδικά σου
    });

    it('Θα πρέπει να επιστρέψει σωστά τα δεδομένα ενός GAME (ID: 1)', async () => {
        const res = await request(app).get('/api/product/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.product_type).toBe('game');
        expect(res.body.platform).toBe('PC');
        expect(res.body.title).toBe('Test Game');
    });

    it('Θα πρέπει να επιστρέψει σωστά τα δεδομένα ενός ACCESSORY (ID: 2)', async () => {
        const res = await request(app).get('/api/product/2');
        expect(res.statusCode).toBe(200);
        expect(res.body.product_type).toBe('accessory');
        expect(res.body.brand).toBe('Sony');
        expect(res.body.accessory_type).toBe('gamepad');
    });

    it('Θα πρέπει να επιστρέψει σωστά τα δεδομένα ενός COLLECTIBLE (ID: 3)', async () => {
        const res = await request(app).get('/api/product/3');
        expect(res.statusCode).toBe(200);
        expect(res.body.product_type).toBe('collectible');
        expect(res.body.brand).toBe('Funko');
        expect(res.body.collectible_type).toBe('figure');
    });

    it('Θα πρέπει να επιστρέψει 500 αν "σκάσει" η βάση', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Αναγκάζουμε τη βάση να πετάξει error κόβοντας τη σύνδεση
        await sequelize.close();

        const res = await request(app).get('/api/product/1');
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Database error.');

        consoleSpy.mockRestore();
    });
});