import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminProducts from './AdminProducts';
import axios from 'axios';

// 1. Mock το Axios
jest.mock('axios');

// 2. Mock το AuthContext
jest.mock('../Authentication/AuthContext', () => ({
    useAuth: () => ({
        token: 'fake-admin-token'
    })
}));

// 3. Mock το react-select για να μπορούμε να το ελέγχουμε εύκολα στα tests
jest.mock('react-select', () => ({ options, value, onChange, placeholder }) => (
    <select
        data-testid="mock-select"
        value={value ? value.value : 'none'}
        onChange={(e) => {
            const selectedOption = options.find(opt => opt.value === e.target.value);
            onChange(selectedOption);
        }}
    >
        <option value="none">{placeholder}</option>
        {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
));

describe('AdminProducts Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Κάνουμε mock τα alerts και confirms του browser
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        jest.spyOn(window, 'confirm').mockImplementation(() => true);
    });

    afterEach(() => {
        window.alert.mockRestore();
        window.confirm.mockRestore();
    });

    // Βοηθητική συνάρτηση για να βρίσκουμε τα inputs
    const getInput = (id) => document.getElementById(id);

    it('1. Πρέπει να εμφανίζει τα σωστά πεδία όταν επιλέγεται τύπος "game"', async () => {
        // Προσομοίωση του API call που γίνεται όταν αλλάζει το select type
        axios.get.mockResolvedValueOnce({ data: [] }); 

        render(<AdminProducts />);

        // Βρίσκουμε το πρώτο mock-select (Product Type)
        const typeSelect = screen.getAllByTestId('mock-select')[0];
        
        // Αλλάζουμε την τιμή σε 'game'
        fireEvent.change(typeSelect, { target: { value: 'game' } });

        // Περιμένουμε να εμφανιστούν τα πεδία του game
        await waitFor(() => {
            expect(screen.getByText(/Platform:/i)).toBeInTheDocument();
            expect(screen.getByText(/Developer:/i)).toBeInTheDocument();
            expect(screen.getByText(/Release Date:/i)).toBeInTheDocument();
            // Το πεδίο Brand δεν πρέπει να υπάρχει (είναι για accessories/collectibles)
            expect(screen.queryByText(/Brand:/i)).not.toBeInTheDocument();
        });
    });

    it('2. Πρέπει να μπλοκάρει το ανέβασμα αν λείπουν πεδία (Validation)', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });
        render(<AdminProducts />);

        // Επιλέγουμε type "accessory"
        const typeSelect = screen.getAllByTestId('mock-select')[0];
        fireEvent.change(typeSelect, { target: { value: 'accessory' } });

        // Συμπληρώνουμε μόνο τον τίτλο (επίτηδες αφήνουμε κενά τα άλλα)
        await waitFor(() => {
            fireEvent.change(getInput('title'), { target: { value: 'New Controller' } });
        });

        // Βρίσκουμε το Upload κουμπί (είναι το 3ο κουμπί στη σειρά)
        const buttons = screen.getAllByRole('button');
        const uploadButton = buttons[2]; 

        fireEvent.click(uploadButton);

        // Περιμένουμε να πεταχτεί το alert για τα κενά πεδία
        expect(window.alert).toHaveBeenCalledWith('Συμπλήρωσε τα κενά');
        // Σιγουρευόμαστε ότι το axios.post ΔΕΝ καλέστηκε
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('3. Πρέπει να καλεί το API (Upload) όταν όλα τα πεδία είναι σωστά', async () => {
        axios.get.mockResolvedValueOnce({ data: [] }); // Για το fetch των προϊόντων
        axios.post.mockResolvedValueOnce({ data: { product: { product_id: 1, title: 'Test' } } }); // Για το upload

        render(<AdminProducts />);

        // Επιλέγουμε type "collectible"
        const typeSelect = screen.getAllByTestId('mock-select')[0];
        fireEvent.change(typeSelect, { target: { value: 'collectible' } });

        await waitFor(() => {
            // Βασικά πεδία
            fireEvent.change(getInput('title'), { target: { value: 'Batman Figure' } });
            fireEvent.change(getInput('price'), { target: { value: '50' } });
            fireEvent.change(getInput('stock_quantity'), { target: { value: '10' } });
            fireEvent.change(getInput('description_'), { target: { value: 'A cool figure' } });
            
            // Πεδία Collectible
            fireEvent.change(getInput('brand'), { target: { value: 'DC' } });
            fireEvent.change(getInput('collectible_type'), { target: { value: 'Action Figure' } });
        });

        // Για να περάσει το validation θέλει και εικόνα!
        const imageInput = getInput('coverImageUpload');
        const file = new File(['dummy content'], 'batman.png', { type: 'image/png' });
        fireEvent.change(imageInput, { target: { files: [file] } });

        // Πατάμε Upload
        const uploadButton = screen.getAllByRole('button')[2];
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:4000/api/admin/products/upload',
                expect.any(FormData), // Επειδή στέλνεις FormData
                expect.objectContaining({
                    headers: { 'Authorization': 'Bearer fake-admin-token' }
                })
            );
            expect(window.alert).toHaveBeenCalledWith('Το προϊόν ανέβηκε επιτυχώς!');
        });
    });
});