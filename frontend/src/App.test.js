import { render, screen } from '@testing-library/react';
import App from './App';

// 1. MOCK ΤΟ AUTH CONTEXT
jest.mock('./Authentication/AuthContext', () => ({
  useAuth: () => ({
    user: null, // Προεπιλογή: Guest
  }),
}));

// 2. MOCK ΤΟ AXIOS (Γενικό Mock για να μην χτυπάει το import σε άλλα αρχεία)
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn().mockReturnThis(),
}));

// 3. ΠΛΗΡΕΣ MOCK ΤΟΥ REACT-ROUTER-DOM (Η ΛΥΣΗ ΤΟΥ ΠΡΟΒΛΗΜΑΤΟΣ)
// ΔΕΝ χρησιμοποιούμε το requireActual. Φτιάχνουμε δικά μας "ψεύτικα" components.
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => <div data-testid="route">{element}</div>,
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
}));

// 4. MOCK ΤΑ ΒΑΣΙΚΑ COMPONENTS
// Έτσι το Jest δεν θα τρέξει τον πραγματικό κώδικα αυτών των αρχείων, γλιτώνοντας errors
jest.mock('./HomePage.js', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('./Games.js', () => () => <div data-testid="games-page">Games Page</div>);
jest.mock('./Authentication/Login.js', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('./Header.js', () => () => <div data-testid="header">Header</div>);
jest.mock('./ItemTab.js', () => () => <div data-testid="item-tab">ItemTab</div>);
jest.mock('./Footer.js', () => () => <div data-testid="footer">Footer</div>);

describe('App Basic Rendering', () => {
  // 1. Σιγάζουμε τα console.error για καθαρό terminal
  let consoleSpy;
  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders core components without crashing', () => {
    // 2. Ελέγχουμε την συμπεριφορά του axios για να μην "σκάει" στα .data
    const axios = require('axios');
    axios.get.mockResolvedValue({ data: [] }); 

    render(<App />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('item-tab')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getAllByTestId('home-page')[0]).toBeInTheDocument();
  });
});