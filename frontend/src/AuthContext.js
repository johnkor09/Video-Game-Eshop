import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
/*  Για το authentication εχουμε jwt γιατι μας το ζηταει η εργασια.
     */

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    // Αρχικοποίηση από το localStorage
    const [token, setToken] = useState(localStorage.getItem('userToken'));
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            const storedToken = localStorage.getItem('userToken');
            
            if (storedToken) {
                try {
                    // αποκρυπτογραφει το token
                    const decoded = jwtDecode(storedToken);
                    
                    // ελεγχει αν εληξε το token (το exp είναι σε δευτερόλεπτα)
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        // Αν εληξε κανει logout
                        console.log("Token expired");
                        logout();
                    } else {
                        // Το token ειναι σωστο
                        setToken(storedToken);
                        setUser(decoded); // Το decoded περιέχει id, email, iat, exp
                    }
                } catch (error) {
                    // Αν το token εχει προβλημα
                    console.error("Invalid token", error);
                    logout();
                }
            }
            setIsAuthLoading(false);
        };

        loadUser();
    }, []); // Τρεχει μονο μια φορα

    const login = (newToken) => {
        //γινεται αποθηκεσυη του τοκεν στο localstorage
        //  ετσι μενει ο χρηστης για 2 ωρες (δλδ μεχρι να ληξει το token) αν κλεισει η εφαρμογη 
        // ειναι σαν τα cookies 
        // εννοειται πως αν ληξει γινεται logout
        localStorage.setItem('userToken', newToken); 
        setToken(newToken);
        
        // Αποκωδικοποιούμε αμέσως για να ενημερωθεί το UI
        try {
            const decoded = jwtDecode(newToken);
            setUser(decoded);
        } catch (e) {
            console.error("Login decode error", e);
        }
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setToken(null);
        setUser(null);
    };

    const value = {
        token,
        user,
        isLoggedIn: !!token, // true αν υπάρχει token, αλλιώς false
        isAuthLoading,
        login,
        logout,
    };

    if (isAuthLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading session...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};