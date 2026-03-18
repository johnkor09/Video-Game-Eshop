import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileEdit from './ProfileEdit';

// 1. Mock το updateUser function
const mockUpdateUser = jest.fn();

// 2. Mock το AuthContext
jest.mock('../Authentication/AuthContext', () => ({
    useAuth: () => ({
        user: { first_name: 'John', surname: 'Doe', email: 'john@example.com' },
        token: 'fake-profile-token',
        updateUser: mockUpdateUser
    })
}));

describe('ProfileEdit Component Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock το window.alert
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        // Mock το global fetch
        global.fetch = jest.fn();
    });

    afterEach(() => {
        window.alert.mockRestore();
        // Καθαρίζουμε το mock του fetch μετά από κάθε τεστ
        global.fetch.mockClear(); 
    });

    it('1. Πρέπει να φορτώνει τα δεδομένα του χρήστη στα inputs', () => {
        render(<ProfileEdit />);
        
        // Ελέγχουμε αν τα inputs έχουν πάρει τις αρχικές τιμές από το context
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        
        // Ελέγχουμε αν το email υπάρχει και αν είναι όντως disabled
        const emailInput = screen.getByDisplayValue('john@example.com');
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toBeDisabled();
    });

    it('2. Πρέπει να ενημερώνει τα πεδία όταν ο χρήστης πληκτρολογεί', () => {
    render(<ProfileEdit />);
    
    // Αντί για getByLabelText, βρίσκουμε το input από την τρέχουσα τιμή του
    const nameInput = screen.getByDisplayValue('John');
    const surnameInput = screen.getByDisplayValue('Doe');

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.change(surnameInput, { target: { value: 'Smith' } });

    expect(nameInput.value).toBe('Jane');
    expect(surnameInput.value).toBe('Smith');
});

it('3. Πρέπει να καλεί το fetch και το updateUser στην αποθήκευση', async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
    });

    render(<ProfileEdit />);
    
    const nameInput = screen.getByDisplayValue('John');
    const surnameInput = screen.getByDisplayValue('Doe');
    const saveButton = screen.getByRole('button', { name: /Αποθήκευση/i });

    fireEvent.change(nameInput, { target: { value: 'Brasidas' } });
    fireEvent.change(surnameInput, { target: { value: 'Spartan' } });

    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(mockUpdateUser).toHaveBeenCalledWith({
            name: 'Brasidas',
            surname: 'Spartan'
        });
    });
});
});