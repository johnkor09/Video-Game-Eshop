import { render, screen, waitFor } from '@testing-library/react';
import OrderHistory from './OrderHistory';

// 1. Mock το fetch
global.fetch = jest.fn();

// 2. Mock το AuthContext
jest.mock('../Authentication/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 1 },
        token: 'fake-history-token'
    })
}));

// 3. Mock το react-router-dom (ΑΥΤΟ ΛΥΝΕΙ ΤΟ FAIL)
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

const mockOrders = [
    {
        order_id: 501,
        created_at: '2023-10-01T12:00:00Z',
        total_amount: '59.99',
        status: 'Completed'
    },
    {
        order_id: 502,
        created_at: '2023-10-05T15:30:00Z',
        total_amount: '29.90',
        status: 'Pending'
    }
];

describe('OrderHistory Component Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('1. Εμφανίζει τη λίστα των παραγγελιών σωστά', async () => {
        // Mock την απάντηση του fetch
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOrders
        });

        render(<OrderHistory />);

        // Περιμένουμε να φύγει το loading και να εμφανιστούν τα ID
        await waitFor(() => {
            expect(screen.getByText(/501/)).toBeInTheDocument();
            expect(screen.getByText(/502/)).toBeInTheDocument();
        });

        // Έλεγχος ποσών
        expect(screen.getByText(/59.99/)).toBeInTheDocument();
        expect(screen.getByText(/29.90/)).toBeInTheDocument();
    });

    it('2. Εμφανίζει μήνυμα αν το ιστορικό είναι άδειο', async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [] // Επιστρέφουμε άδεια λίστα
    });

    render(<OrderHistory />);

    await waitFor(() => {
        // Χρησιμοποιούμε μέρος του κειμένου με regex για να είμαστε σίγουροι
        expect(screen.getByText(/Δεν έχετε πραγματοποιήσει παραγγελίες/i)).toBeInTheDocument();
    });
});
});