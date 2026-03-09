const request = require('supertest');
const { sequelize } = require('../../config/db');
const db = require('../../models/index')(sequelize);

const Product = db.Product;
const Game = db.Game;

// Το app γίνεται require ΜΕΤΑ τα models
const app = require('../../server');

describe('Game Controller Integration Tests', () => {
    
    beforeAll(async () => {
        // Καθαρισμός και συγχρονισμός βάσης
        await sequelize.sync({ force: true });
        
        // Δημιουργία δοκιμαστικών δεδομένων
        await Product.create({
            product_id: 1,
            title: 'The Witcher 3',
            price: 30.00,
            is_active: 1,
            product_type: 'game'
        });
        await Game.create({ product_id: 1, platform: 'PC' });

        await Product.create({
            product_id: 2,
            title: 'Spider-Man 2',
            price: 70.00,
            is_active: 1,
            product_type: 'game'
        });
        await Game.create({ product_id: 2, platform: 'PS5' });
    });

    afterAll(async () => {
        // Κλείνουμε τη σύνδεση με ασφάλεια
        try {
            await sequelize.close();
        } catch (err) {}
    });

    // --- TESTS ---

    it('GET /api/games/all - Success path', async () => {
        const res = await request(app).get('/api/games/all');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('platform');
    });

    it('GET /api/games/PS5 - Filter path', async () => {
        const res = await request(app).get('/api/games/PS5');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].platform).toBe('PS5');
        expect(res.body[0].title).toBe('Spider-Man 2');
    });

    it('GET /api/games/all?sortBy=Low-High - Sort path', async () => {
        const res = await request(app).get('/api/games/all?sortBy=Low-High');
        
        expect(res.statusCode).toBe(200);
        
        // Μετατροπή σε Number γιατί τα DECIMAL επιστρέφονται ως strings από τη MySQL
        const firstPrice = Number(res.body[0].price);
        const secondPrice = Number(res.body[1].price);
        
        expect(firstPrice).toBeLessThan(secondPrice);
        expect(res.body[0].title).toBe('The Witcher 3'); // Το φθηνότερο (30.00) πρέπει να είναι πρώτο
    });

    it('Θα πρέπει να επιστρέψει 500 αν υπάρχει σφάλμα στη βάση', async () => {
        // Σιγάζουμε το console.error για να μην έχουμε κόκκινα γράμματα στο terminal μας
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Αναγκάζουμε τη βάση να "σκάσει" κλείνοντας τη σύνδεση
        await sequelize.close();

        const res = await request(app).get('/api/games/all');
        
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Database error.');

        consoleSpy.mockRestore();
    });
});