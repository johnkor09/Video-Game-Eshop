import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Basket from './Basket';
import axios from 'axios';

// 1. Mock το Axios
jest.mock('axios');

// 2. Mock το AuthContext
const mockToken = 'fake-user-token';
const mockUser = { id: 1, name: 'TestUser' };
jest.mock('../Authentication/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        token: mockToken
    })
}));

// 3. Mock το react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('Basket Component Tests', () => {
    const mockCartData = [
        {
            item_id: 101,
            product_id: 1,
            product_type: 'Games',
            title: 'Witcher 3',
            platform: 'PC',
            quantity: 2,
            price_at_addition: '20.00',
            cover_image_url: 'witcher.jpg'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        // Ορίζουμε το GET να επιστρέφει δεδομένα για να αποφύγουμε τα undefined errors
        axios.get.mockResolvedValue({ data: mockCartData });
    });

    it('1. Εμφανίζει μήνυμα αν το καλάθι είναι άδειο', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });
        render(<Basket />);
        await waitFor(() => {
            expect(screen.getByText(/Looks like your cart is empty/i)).toBeInTheDocument();
        });
    });

    it('2. Υπολογίζει σωστά το συνολικό ποσό (2 x 20.00 = 40.00)', async () => {
        render(<Basket />);
        // Περιμένουμε να εμφανιστεί η τιμή ανά προϊόντος (πολλαπλασιασμένη)
        await waitFor(() => {
            expect(screen.getByText('€40.00')).toBeInTheDocument();
        });
        // Έλεγχος συνολικού Grand Total
        expect(screen.getByText(/Cart total price: €40.00/i)).toBeInTheDocument();
    });

    it('3. Καλεί το σωστό API κατά την αφαίρεση προϊόντος', async () => {
        axios.delete.mockResolvedValue({ data: { success: true } });
        render(<Basket />);
        
        // Βρίσκουμε το εικονίδιο FaRegTrashCan (στο DOM εμφανίζεται ως svg)
        const removeBtn = await screen.findByRole('img', { hidden: true });
        // Επειδή υπάρχουν πολλά icons, χρησιμοποιούμε querySelector για τον κάδο
        const trashIcon = document.querySelector('.Basket-remove-button');
        fireEvent.click(trashIcon);

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/cart/removeItem'),
                expect.objectContaining({
                    data: { itemId: 101 }
                })
            );
        });
    });

    it('4. Ολοκληρώνει τη διαδικασία Checkout επιτυχώς', async () => {
        axios.post.mockResolvedValue({ data: { success: true } });
        axios.delete.mockResolvedValue({ data: { success: true } });

        render(<Basket />);
        
        // Αναμονή για τη φόρτωση
        await screen.findByText(/Witcher 3/i);

        // 1. Πατάμε το κουμπί Checkout για να ανοίξει το Pop-up
        const checkoutBtn = screen.getByRole('button', { name: /Checkout/i });
        fireEvent.click(checkoutBtn);

        // 2. Πατάμε το "Complete" μέσα στο Pop-up
        const confirmBtn = await screen.findByText(/^Complete$/);
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            // Έλεγχος αν το POST περιέχει τη δομή { user, BasketProducts }
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:4000/api/orders/new',
                expect.objectContaining({
                    user: mockUser,
                    BasketProducts: mockCartData
                }),
                expect.any(Object)
            );
            
            // Έλεγχος αν έγινε navigate στην επιτυχία
            expect(mockNavigate).toHaveBeenCalledWith('/OrderComplete');
        });
    });
});