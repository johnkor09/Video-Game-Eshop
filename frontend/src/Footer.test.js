import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
  it('Θα πρέπει να εμφανίζει το όνομα του καταστήματος και το τρέχον έτος', () => {
    render(<Footer />);
    
    // Ελέγχουμε αν υπάρχει το "Brasidas Store HD"
    const storeName = screen.getByText(/Brasidas Store HD/i);
    expect(storeName).toBeInTheDocument();

    // Ελέγχουμε αν εμφανίζεται το έτος (2026)
    const currentYear = new Date().getFullYear().toString();
    const yearDisplay = screen.getByText(new RegExp(currentYear));
    expect(yearDisplay).toBeInTheDocument();
  });

  it('Θα πρέπει να εμφανίζει τα AM της ομάδας', () => {
    render(<Footer />);
    
    // Ελέγχουμε αν υπάρχει το κείμενο "Our team"
    const teamText = screen.getByText(/Our team:/i);
    expect(teamText).toBeInTheDocument();

    // Ελέγχουμε δειγματοληπτικά ένα AM
    const amNumber = screen.getByText(/22390111/i);
    expect(amNumber).toBeInTheDocument();
  });
});