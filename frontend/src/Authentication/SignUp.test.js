import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './SignUp';

// 1. MOCK ΤΟ AXIOS
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// 2. MOCK ΤΟ USEAUTH HOOK
const mockLoginFn = jest.fn();
jest.mock('./AuthContext', () => ({
  useAuth: () => ({
    login: mockLoginFn,
  }),
}));

// 3. MOCK ΤΟ REACT-ROUTER-DOM (για να μην κρασάρει το test)
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('SignUp Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Βοηθητικές συναρτήσεις για τα IDs
  const getInput = (id) => document.getElementById(id);

  it('1. Θα πρέπει να ενημερώνει όλα τα πεδία της φόρμας', () => {
    render(<SignUp />);

    fireEvent.change(getInput('name'), { target: { value: 'John' } });
    fireEvent.change(getInput('surname'), { target: { value: 'Doe' } });
    fireEvent.change(getInput('email'), { target: { value: 'test@test.com' } });
    fireEvent.change(getInput('pass1'), { target: { value: 'Pass123!' } });

    expect(getInput('name').value).toBe('John');
    expect(getInput('surname').value).toBe('Doe');
    expect(getInput('email').value).toBe('test@test.com');
  });

  it('2. Θα πρέπει να εμφανίζει error αν οι κωδικοί δεν ταιριάζουν', async () => {
    render(<SignUp />);

    // Γεμίζουμε τα πεδία ώστε να περάσουν τα πρώτα IF
    fireEvent.change(getInput('name'), { target: { value: 'John' } });
    fireEvent.change(getInput('surname'), { target: { value: 'Doe' } });
    fireEvent.change(getInput('email'), { target: { value: 'test@test.com' } });
    
    // Βάζουμε διαφορετικούς κωδικούς
    fireEvent.change(getInput('pass1'), { target: { value: 'Password123!' } });
    fireEvent.change(getInput('pass2'), { target: { value: 'Different123!' } });

    fireEvent.click(screen.getByRole('button', { name: /CREATE ACCOUNT/i }));

    expect(screen.getByText(/Passwords don't match!/i)).toBeInTheDocument();
  });

  it('3. Θα πρέπει να εμφανίζει error για μη έγκυρο email', () => {
    render(<SignUp />);
    
    fireEvent.change(getInput('name'), { target: { value: 'John' } });
    fireEvent.change(getInput('surname'), { target: { value: 'Doe' } });
    fireEvent.change(getInput('email'), { target: { value: 'wrong-email' } });

    fireEvent.click(screen.getByRole('button', { name: /CREATE ACCOUNT/i }));

    expect(screen.getByText(/Email is invalid!/i)).toBeInTheDocument();
  });

  it('4. Θα πρέπει να καλεί το API και να κάνει navigate σε επιτυχία', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValueOnce({
      data: { success: true, token: 'fake-signup-token' }
    });

    render(<SignUp />);

    // Συμπλήρωση σωστών στοιχείων (ώστε να περάσει τα Regex)
    fireEvent.change(getInput('name'), { target: { value: 'John' } });
    fireEvent.change(getInput('surname'), { target: { value: 'Doe' } });
    fireEvent.change(getInput('email'), { target: { value: 'john@doe.com' } });
    fireEvent.change(getInput('pass1'), { target: { value: 'John123!' } });
    fireEvent.change(getInput('pass2'), { target: { value: 'John123!' } });

    fireEvent.click(screen.getByRole('button', { name: /CREATE ACCOUNT/i }));

    await waitFor(() => {
      // Έλεγχος αν στάλθηκαν τα σωστά δεδομένα στο σωστό URL
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/auth/signup',
        expect.objectContaining({ name: 'John', email: 'john@doe.com' })
      );
      
      // Έλεγχος αν έγινε login και navigation
      expect(mockLoginFn).toHaveBeenCalledWith('fake-signup-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});