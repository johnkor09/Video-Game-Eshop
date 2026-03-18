import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Basket from './Basket';
import axios from 'axios';

// 1. Mock το Axios
jest.mock('axios');

// 2. Mock το AuthContext για να είμαστε "συνδεδεμένοι"
jest.mock('../Authentication/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 1, name: 'TestUser' },
        token: 'fake-user-token'
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
        // Mock τα alerts
        jest.spyOn(window, 'alert').mockImplementation(() => { });
    });

    afterEach(() => {
        window.alert.mockRestore();
    });

    it('1. Πρέπει να εμφανίζει άδειο καλάθι αν δεν υπάρχουν προϊόντα', async () => {
        // Προσομοίωση άδειου καλαθιού από το API
        axios.get.mockResolvedValueOnce({ data: [] });

        render(<Basket />);

        // Περιμένουμε να φύγει το "Φόρτωση καλαθιού..."
        await waitFor(() => {
            expect(screen.getByText(/Looks like your cart is empty/i)).toBeInTheDocument();
        });

        // Το κουμπί checkout πρέπει να είναι disabled
        const checkoutButton = screen.getByRole('button', { name: /Checkout/i });
        expect(checkoutButton).toBeDisabled();
    });

    it('2. Πρέπει να υπολογίζει σωστά το Total Price και να εμφανίζει τα προϊόντα', async () => {
        // Προσομοίωση γεμάτου καλαθιού (2 τεμάχια x 20.00€ = 40.00€)
        axios.get.mockResolvedValueOnce({ data: mockCartData });

        render(<Basket />);

        // Περιμένουμε να φορτώσει το προϊόν
        await waitFor(() => {
            expect(screen.getByText(/Witcher 3 \(PC\)/i)).toBeInTheDocument();
        });

        // Έλεγχος ότι η συνολική τιμή του αντικειμένου είναι 40.00
        expect(screen.getByText('€40.00')).toBeInTheDocument();

        // Έλεγχος ότι το Grand Total είναι επίσης 40.00
        expect(screen.getByText(/Cart total price: €40.00/i)).toBeInTheDocument();

        // Το checkout δεν πρέπει να είναι disabled
        const checkoutButton = screen.getByRole('button', { name: /Checkout/i });
        expect(checkoutButton).not.toBeDisabled();
    });

    it('3. Πρέπει να καλεί το DELETE API όταν πατάμε τον κάδο', async () => {
        axios.get.mockResolvedValueOnce({ data: mockCartData });
        // Προσομοίωση επιτυχούς διαγραφής
        axios.delete.mockResolvedValueOnce({ data: { success: true } });
        // Δεύτερο GET για όταν ξαναφορτώνει το καλάθι μετά τη διαγραφή
        axios.get.mockResolvedValueOnce({ data: [] });

        render(<Basket />);

        await waitFor(() => {
            expect(screen.getByText(/Witcher 3/i)).toBeInTheDocument();
        });

        // Στη React-icons ο κάδος δεν έχει text, οπότε θα βρούμε το svg/element με βάση το class
        // Αν το test παραπονεθεί, μπορείς να βάλεις ένα data-testid="delete-btn" στο FaRegTrashCan.
        // Εδώ χρησιμοποιούμε τον container της ποσότητας.
        const trashIcons = document.getElementsByClassName('Basket-remove-button');
        fireEvent.click(trashIcons[0]);

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                'http://localhost:4000/api/cart/removeItem',
                expect.objectContaining({
                    data: { itemId: 101 },
                    headers: { 'Authorization': 'Bearer fake-user-token' }
                })
            );
        });
    });

    it('4. Πρέπει να ανοίγει το Modal του Checkout και να ολοκληρώνει την αγορά', async () => {
        // 1. Ρυθμίζουμε μόνιμα το GET να επιστρέφει το καλάθι
        axios.get.mockResolvedValue({ data: mockCartData });
        // 2. Mock το POST της παραγγελίας
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        // 3. Mock το DELETE (ClearCart) 
        axios.delete.mockResolvedValueOnce({ data: { success: true } });

        render(<Basket />);

        // Περιμένουμε να φύγει το loading και να εμφανιστεί το καλάθι
        await waitFor(() => {
            expect(screen.getByText(/Witcher 3/i)).toBeInTheDocument();
        });

        // 1. Βρίσκουμε το κουμπί Checkout και το πατάμε
        const checkoutButton = screen.getByRole('button', { name: /Checkout/i });
        fireEvent.click(checkoutButton);

        // 2. Ελέγχουμε αν εμφανίστηκε το popup
        const completePurchaseHeader = await screen.findByText(/Complete purchase\?/i);
        expect(completePurchaseHeader).toBeInTheDocument();

        // 3. Πατάμε το κουμπί Complete
        const completeButton = screen.getByRole('button', { name: 'Complete' });
        fireEvent.click(completeButton);

        // 4. Ελέγχουμε αν κλήθηκαν σωστά τα APIs και έγινε navigate
        await waitFor(() => {
            // Έλεγχος order post
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:4000/api/orders/new',
                expect.objectContaining({ BasketProducts: mockCartData })
            );
            // Έλεγχος clear cart delete
            expect(axios.delete).toHaveBeenCalledWith(
                'http://localhost:4000/api/cart/clear',
                expect.any(Object)
            );
            // Έλεγχος αλλαγής σελίδας
            expect(mockNavigate).toHaveBeenCalledWith('/OrderComplete');
        });
    });
});