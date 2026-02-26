import HomePage from './HomePage.js';
import Games from './Games.js';
import Header from './Header.js';
import ItemTab from './ItemTab.js';
import Footer from './Footer.js';
import Login from './Authentication/Login.js';
import Signup from './Authentication/SignUp.js';
import AdminPanel from './Admin/AdminPanel';
import ProductDetailPage from './Items/ProductDetailPage';
import NintendoGames from './Items/NintendoGames';
import XboxGames from './Items/XboxGames';
import Accessories from './Items/Accessories';
import Collectibles from './Items/Collectibles';
import PCGames from './Items/PCGames';
import PlaystationGames from './Items/PlaystationGames';
import Basket from './UserFunctions/Basket.js';
import AccountCenter from './UserFunctions/AccountCenter.js';
import AdminAnalytics from './Admin/AdminAnalytics.js'
import AdminProducts from './Admin/AdminProducts.js'
import AdminCustomers from './Admin/AdminCustomers.js'
import OrderComplete from './OrderComplete.js';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './Authentication/AuthContext';

function App() {
  const { user } = useAuth();
  return (

    <BrowserRouter>
      <div className="App">
        <Header />
        <ItemTab />
        <div className="Body">

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Games" element={<Games />} />
            <Route path="/Accessories" element={<Accessories />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path='/Games/Nintendo' element={<NintendoGames />} />
            <Route path='/Games/Playstation' element={<PlaystationGames />} />
            <Route path='/Games/Xbox' element={<XboxGames />} />
            <Route path='/Games/Collectibles' element={<Collectibles />} />
            <Route path='/Games/Pc' element={<PCGames />} />
            <Route path="/:product_type/:productId" element={<ProductDetailPage />} />
            <Route path='/:userId/basket' element={<Basket />} />
            <Route path='/:userId/Account' element={<AccountCenter />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            {user && (<Route path='/OrderComplete' element={<OrderComplete />} />)}
            {user && user.role ? (<>
              <Route path="/admin-panel/customers" element={<AdminPanel Panel={AdminCustomers} />} />
              <Route path="/admin-panel/analytics" element={<AdminPanel Panel={AdminAnalytics} />} />
              <Route path="/admin-panel/products" element={<AdminPanel Panel={AdminProducts} />} />customers
            </>) : (null)}
          </Routes>

        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

