// 1. Κάνουμε Mock το DB Config για να μην προσπαθήσει καν να συνδεθεί στη MySQL
jest.mock('../../config/db', () => ({
    sequelize: {
        transaction: jest.fn()
    }
}));

// 2. Κάνουμε Mock τα Models επιστρέφοντας ΠΑΝΤΑ το ίδιο αντικείμενο
jest.mock('../../models/index', () => {
    // Φτιάχνουμε το mock instance ΜΙΑ φορά
    const mockDbInstance = {
        Product: { findOne: jest.fn(), destroy: jest.fn(), create: jest.fn(), update: jest.fn() },
        Game: { create: jest.fn(), update: jest.fn() },
        Collectible: { create: jest.fn(), update: jest.fn() },
        Accessory: { create: jest.fn(), update: jest.fn() }
    };
    // Επιστρέφουμε πάντα αυτό
    return () => mockDbInstance; 
});

// 3. Κάνουμε Mock το File System
jest.mock('fs', () => ({
    promises: { unlink: jest.fn() }
}));

// 4. ΤΩΡΑ κάνουμε require τα αρχεία (αφού έχουν στηθεί τα mocks)
const fs = require('fs').promises;
const { sequelize } = require('../../config/db');
const db = require('../../models/index')(); // Παίρνει το mockDbInstance
const adminController = require('../AdminController'); // ΑΛΛΑΞΕ ΤΟ στο σωστό όνομα αρχείου

// Στήνουμε το mock του transaction
const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    finished: false
};

describe('Admin Controller Unit Tests', () => {

    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Ορίζουμε τι επιστρέφει το sequelize.transaction()
        mockTransaction.finished = false;
        sequelize.transaction.mockResolvedValue(mockTransaction);

        req = {
            params: {},
            body: {},
            files: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        // Σιγάζουμε τα console.error για καθαρό terminal
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('deleteProduct', () => {
        it('Θα πρέπει να επιστρέψει 404 αν το προϊόν δεν βρεθεί', async () => {
            req.params.productId = 999;
            db.Product.findOne.mockResolvedValue(null);

            await adminController.deleteProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product not found.' });
        });

        it('Θα πρέπει να διαγράψει το προϊόν και την εικόνα του', async () => {
            req.params.productId = 1;
            db.Product.findOne.mockResolvedValue({ cover_image_url: 'test_image.jpg' });
            fs.unlink.mockResolvedValue(true);

            await adminController.deleteProduct(req, res);

            expect(fs.unlink).toHaveBeenCalled(); 
            expect(db.Product.destroy).toHaveBeenCalledWith({ where: { product_id: 1 } });
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Product deleted successfully.' });
        });
    });

    describe('createProduct', () => {
        it('Θα πρέπει να δημιουργήσει ένα νέο Game και να κάνει commit το transaction', async () => {
            req.body = {
                title: 'Test Game',
                price: 50,
                product_type: 'game',
                developer: 'TestDev'
            };
            
            db.Product.create.mockResolvedValue({ product_id: 10, dataValues: { product_id: 10 } });

            await adminController.createProduct(req, res);

            expect(sequelize.transaction).toHaveBeenCalled(); 
            expect(db.Product.create).toHaveBeenCalled(); 
            expect(db.Game.create).toHaveBeenCalled(); 
            expect(mockTransaction.commit).toHaveBeenCalled(); 
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('Θα πρέπει να κάνει rollback αν το product_type είναι άκυρο', async () => {
            req.body = { title: 'Bad Product', product_type: 'unknown' };
            db.Product.create.mockResolvedValue({ product_id: 11 });

            await adminController.createProduct(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled(); 
            expect(res.status).toHaveBeenCalledWith(500); 
        });
    });

    describe('updateProduct', () => {
        it('Θα πρέπει να κάνει update ένα Accessory και να κάνει commit', async () => {
            req.params.productId = 5;
            req.body = {
                title: 'Updated Hat',
                product_type: 'accessory',
                accessory_type: 'hats'
            };

            await adminController.updateProduct(req, res);

            expect(db.Product.update).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ where: { product_id: 5 }, transaction: mockTransaction })
            );
            expect(db.Accessory.update).toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});