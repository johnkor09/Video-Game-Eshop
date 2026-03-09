// 1. Mocking της Βάσης
jest.mock('../../config/db', () => ({
    sequelize: {}
}));

jest.mock('../../models/index', () => {
    const mockDbInstance = {
        Product: {
            findByPk: jest.fn()
        },
        Cart: {
            findOne: jest.fn(),
            findOrCreate: jest.fn()
        },
        CartItem: {
            findOne: jest.fn(),
            findAll: jest.fn(),
            findOrCreate: jest.fn(),
            destroy: jest.fn()
        }
    };
    return () => mockDbInstance;
});

const db = require('../../models/index')();
const cartController = require('../CartController'); // ΑΛΛΑΞΕ το path αν χρειάζεται



describe('Cart Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        // Ψεύτικο Request με user object (σαν να πέρασε από το Auth Middleware)
        req = {
            user: { id: 1 },
            body: {},
            params: {}
        };

        // Ψεύτικο Response
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    // --- 1. RemoveCartItem TESTS ---
    describe('RemoveCartItem', () => {
        it('Θα πρέπει να επιστρέψει 400 αν το itemId είναι άκυρο', async () => {
            req.body.itemId = "invalid";
            
            await cartController.RemoveCartItem(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Μη έγκυρο Cart item ID.' });
        });

        it('Θα πρέπει να διαγράψει το item αν όλα είναι σωστά', async () => {
            req.body.itemId = 5;
            
            // Το καλάθι του χρήστη υπάρχει
            db.Cart.findOne.mockResolvedValue({ cart_id: 10 });
            // Η διαγραφή βρίσκει και διαγράφει 1 εγγραφή
            db.CartItem.destroy.mockResolvedValue(1); 

            await cartController.RemoveCartItem(req, res);

            expect(db.CartItem.destroy).toHaveBeenCalledWith({
                where: { item_id: 5, cart_id: 10 }
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    // --- 2. ChangeQuantity TESTS ---
    describe('ChangeQuantity', () => {
        it('Θα πρέπει να επιστρέψει 400 αν η νέα ποσότητα ξεπερνά το διαθέσιμο stock', async () => {
            req.body = { itemId: 1, NewQuantity: 10 };
            
            db.Cart.findOne.mockResolvedValue({ cart_id: 10 });
            
            // Φτιάχνουμε ένα fake cartItem που έχει include το Product (με stock 5)
            const mockCartItem = {
                product: { stock_quantity: 5 },
                update: jest.fn()
            };
            db.CartItem.findOne.mockResolvedValue(mockCartItem);

            await cartController.ChangeQuantity(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Not available Stock. Max stock: 5'
            }));
            expect(mockCartItem.update).not.toHaveBeenCalled();
        });

        it('Θα πρέπει να κάνει update την ποσότητα αν υπάρχει αρκετό stock', async () => {
            req.body = { itemId: 1, NewQuantity: 3 };
            
            db.Cart.findOne.mockResolvedValue({ cart_id: 10 });
            
            const mockCartItem = {
                product: { stock_quantity: 5 },
                update: jest.fn().mockResolvedValue(true)
            };
            db.CartItem.findOne.mockResolvedValue(mockCartItem);

            await cartController.ChangeQuantity(req, res);

            expect(mockCartItem.update).toHaveBeenCalledWith({ quantity: 3 });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    // --- 3. AddItemToCart TESTS ---
    describe('AddItemToCart', () => {
        it('Θα πρέπει να επιστρέψει 400 αν το προϊόν δεν υπάρχει ή είναι inactive', async () => {
            req.body = { productId: 99, quantity: 1 };
            
            // Το προϊόν δεν βρέθηκε
            db.Product.findByPk.mockResolvedValue(null);

            await cartController.AddItemToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product not found or unavailable!' });
        });

        it('Θα πρέπει να προσθέσει νέο προϊόν στο καλάθι (create)', async () => {
            req.body = { productId: 2, quantity: 1 };
            
            db.Product.findByPk.mockResolvedValue({ price: 20, stock_quantity: 10, is_active: 1 });
            db.Cart.findOrCreate.mockResolvedValue([{ cart_id: 1 }]);
            
            // Το findOrCreate του CartItem επιστρέφει το item και ένα boolean (true = δημιουργήθηκε νέο)
            db.CartItem.findOrCreate.mockResolvedValue([{ item_id: 1, quantity: 1 }, true]);

            await cartController.AddItemToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Item added to cart.'
            }));
        });
    });

    // --- 4. CartContent TESTS ---
    describe('CartContent', () => {
        it('Θα πρέπει να επιστρέψει άδειο array αν το καλάθι είναι άδειο', async () => {
            db.Cart.findOrCreate.mockResolvedValue([{ cart_id: 1 }]);
            db.CartItem.findAll.mockResolvedValue([]); // Κανένα προϊόν

            await cartController.CartContent(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('Θα πρέπει να επιστρέψει τα προϊόντα μορφοποιημένα σωστά', async () => {
            db.Cart.findOrCreate.mockResolvedValue([{ cart_id: 1 }]);
            
            // Φτιάχνουμε το array που θα επέστρεφε η βάση (με το include)
            const fakeCartItems = [{
                item_id: 1,
                quantity: 2,
                price_at_addition: 20,
                product: {
                    product_id: 5,
                    title: 'Test Game',
                    cover_image_url: 'img.jpg',
                    stock_quantity: 10,
                    product_type: 'game'
                }
            }];
            db.CartItem.findAll.mockResolvedValue(fakeCartItems);

            await cartController.CartContent(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{
                item_id: 1,
                quantity: 2,
                price_at_addition: 20,
                product_id: 5,
                title: 'Test Game',
                cover_image_url: 'img.jpg',
                stock_quantity: 10,
                product_type: 'game'
            }]);
        });
    });
});