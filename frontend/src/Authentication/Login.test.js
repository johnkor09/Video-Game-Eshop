import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

// 1. MOCK ΤΟ AXIOS ΧΩΡΙΣ IMPORT
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// 2. MOCK ΤΟ USEAUTH HOOK ΑΠΕΥΘΕΙΑΣ
const mockLoginFn = jest.fn();
jest.mock('./AuthContext', () => ({
  useAuth: () => ({
    login: mockLoginFn,
  }),
}));

// 3. MOCK ΤΟ REACT-ROUTER-DOM
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('Login Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Μικρή συνάρτηση βοήθειας για να βρίσκουμε τα inputs από το ID τους
  const getEmailInput = () => document.getElementById('email');
  const getPasswordInput = () => document.getElementById('password');

  it('1. Θα πρέπει να ενημερώνει τα πεδία email και password', () => {
    render(<Login />);
    
    // Βρίσκουμε τα inputs κατευθείαν από το DOM
    const emailInput = getEmailInput();
    const passwordInput = getPasswordInput();

    // Προσομοιώνουμε την πληκτρολόγηση
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('123456');
  });

  it('2. Θα πρέπει να εμφανίζει error αν τα στοιχεία είναι λάθος (API Error)', async () => {
    const axios = require('axios');
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Wrong credentials' } }
    });

    render(<Login />);
    
    // Πατάμε το κουμπί LOGIN
    fireEvent.click(screen.getByRole('button', { name: /LOGIN/i }));

    // Περιμένουμε να εμφανιστεί το error στην οθόνη
    await waitFor(() => {
      expect(screen.getByText(/Wrong credentials/i)).toBeInTheDocument();
    });
  });

  it('3. Θα πρέπει να καλεί τη login() και να κάνει navigate σε επιτυχία', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValueOnce({
      data: { success: true, token: 'fake-jwt-token' }
    });

    render(<Login />);
    
    // Βρίσκουμε τα inputs και γράφουμε τα στοιχεία
    fireEvent.change(getEmailInput(), { target: { value: 'test@example.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: '123456' } });
    
    // Πατάμε LOGIN
    fireEvent.click(screen.getByRole('button', { name: /LOGIN/i }));

    await waitFor(() => {
      // 1. Έλεγχος axios post
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/auth/login', 
        { email: 'test@example.com', password: '123456' }
      );
      
      // 2. Έλεγχος κλήσης της login
      expect(mockLoginFn).toHaveBeenCalledWith('fake-jwt-token');
      
      // 3. Έλεγχος navigation
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});