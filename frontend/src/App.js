import Home from './Home.js';
import Header from './Header.js';
import ItemTab from './ItemTab.js';
import Footer from './Footer.js';
import Login from './Login.js';
import Signup from './SignUp.js';
import PageOfItem from './PageOfItem.js';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    
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
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
    
  );
}

export default App;

