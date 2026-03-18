// --- 1. Mock της Βάσης ---
jest.mock('../../config/db', () => ({
    sequelize: {
        fn: jest.fn(),
        col: jest.fn()
    }
}));

jest.mock('../../models/index', () => {
    const mockDbInstance = {
        Order: {
            create: jest.fn(),
            findAll: jest.fn()
        },
        OrderItem: {
            bulkCreate: jest.fn()
        }
    };
    return () => mockDbInstance;
});

const db = require('../../models/index')();
const orderController = require('../OrderController'); // Προσάρμοσε το path αν χρειάζεται

describe('Order Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, user: { id: 1 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('CreateOrder', () => {
        it('1. Θα πρέπει να επιστρέψει 400 αν το καλάθι είναι άδειο', async () => {
            req.body = { user: { id: 1 }, BasketProducts: [] };

            await orderController.CreateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Order must contain products.'
            }));
        });

        it('2. Θα πρέπει να δημιουργήσει παραγγελία με σωστό totalAmount', async () => {
            const mockItems = [
                { product_id: 10, title: 'Game A', quantity: 2, price_at_addition: 20 }, // 40€
                { product_id: 11, title: 'Game B', quantity: 1, price_at_addition: 30 }  // 30€
            ];
            req.body = { user: { id: 1 }, BasketProducts: mockItems };

            // Mock τη δημιουργία της παραγγελίας
            db.Order.create.mockResolvedValue({ order_id: 500 });
            db.OrderItem.bulkCreate.mockResolvedValue([]);

            await orderController.CreateOrder(req, res);

            // Έλεγχος αν το total_amount υπολογίστηκε σωστά (40 + 30 = 70)
            expect(db.Order.create).toHaveBeenCalledWith(expect.objectContaining({
                user_id: 1,
                total_amount: 70,
                status: 'Pending'
            }));

            // Έλεγχος αν έγινε το bulkCreate για τα items
            expect(db.OrderItem.bulkCreate).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ order_id: 500, product_id: 10, quantity: 2 })
                ])
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                order_id: 500
            }));
        });
    });

    describe('GetOrder', () => {
        it('3. Θα πρέπει να επιστρέφει τις παραγγελίες του χρήστη', async () => {
            const mockOrders = [
                { order_id: 500, total_amount: 70, created_at: new Date() }
            ];
            db.Order.findAll.mockResolvedValue(mockOrders);

            await orderController.GetOrder(req, res);

            expect(db.Order.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: { user_id: 1 }
            }));
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it('4. Θα πρέπει να επιστρέφει σφάλμα 500 αν κάτι πάει στραβά στη βάση', async () => {
            db.Order.findAll.mockRejectedValue(new Error('DB Error'));

            await orderController.GetOrder(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Error with getting cart items'
            }));
        });
    });
});