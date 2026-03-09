const request = require('supertest');
const { sequelize } = require('../../config/db');
const db = require('../../models/index')(sequelize);

const Product = db.Product;
const Collectible = db.Collectible;

// Κάνουμε require το app ΜΕΤΑ τα μοντέλα
const app = require('../../server');

describe('Collectible Controller Integration Tests', () => {
    
    beforeAll(async () => {
        // Καθαρισμός και συγχρονισμός βάσης
        await sequelize.sync({ force: true });
        
        // Δημιουργία δοκιμαστικών δεδομένων
        await Product.create({
            product_id: 1,
            title: 'Funko Pop Batman',
            price: 15.00,
            is_active: 1,
            product_type: 'collectible'
        });
        await Collectible.create({ product_id: 1, collectible_type: 'figures' });

        await Product.create({
            product_id: 2,
            title: 'Zelda Master Sword Replica',
            price: 150.00,
            is_active: 1,
            product_type: 'collectible'
        });
        await Collectible.create({ product_id: 2, collectible_type: 'props' });
    });

    afterAll(async () => {
        // Χρησιμοποιούμε try/catch γιατί η σύνδεση ίσως έχει ήδη κλείσει από το τελευταίο test
        try {
            await sequelize.close();
        } catch (err) {}
    });

    // --- TESTS ---

    it('GET /api/collectibles/all - Success path', async () => {
        const res = await request(app).get('/api/collectibles/all');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('collectible_type');
    });

    it('GET /api/collectibles/figures - Filter path', async () => {
        const res = await request(app).get('/api/collectibles/figures');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].collectible_type).toBe('figures');
        expect(res.body[0].title).toBe('Funko Pop Batman');
    });

    it('GET /api/collectibles/all?sortBy=Low-High - Sort path', async () => {
        const res = await request(app).get('/api/collectibles/all?sortBy=Low-High');
        
        expect(res.statusCode).toBe(200);
        // Μετατροπή σε Number γιατί η βάση επιστρέφει το DECIMAL ως string
        expect(Number(res.body[0].price)).toBeLessThan(Number(res.body[1].price));
        expect(res.body[0].title).toBe('Funko Pop Batman'); // Το φθηνότερο (15.00) πρέπει να είναι πρώτο
    });

    it('Θα πρέπει να επιστρέψει 500 αν υπάρχει σφάλμα στη βάση', async () => {
        // Κρύβουμε το error log για να μην "λερώσει" το terminal
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Προκαλούμε το σφάλμα κλείνοντας τη βάση
        await sequelize.close();

        const res = await request(app).get('/api/collectibles/all');
        
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Database error.');

        consoleSpy.mockRestore();
    });
});