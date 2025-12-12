import './Footer.css';

export default function Footer() {
    return (
        <footer className="Footer">
            <div className="TextBox">
                <p>&copy; Copyright {new Date().getFullYear()} Brasidas Store HD.</p>
                <p>Our team: AM:22390111, AM:22390022, AM:22390304, AM:22390232</p>
            </div>
        </footer>
    );

};