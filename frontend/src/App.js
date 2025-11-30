import Home from './Home.js';
import Header from './Header.js';
import ItemTab from './ItemTab.js';
import Footer from './Footer.js';
import Login from './Authentication/Login.js';
import Signup from './Authentication/SignUp.js';
import PageOfItem from './PageOfItem.js';
import AdminPanel from './AdminPanel';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Authentication/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Header />
          <div className="Body">
            <ItemTab/>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/PageOfItem" element={<PageOfItem />} />
              <Route path="/admin-panel" element={<AdminPanel/>}/>
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

