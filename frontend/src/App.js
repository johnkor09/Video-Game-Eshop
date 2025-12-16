import HomePage from './HomePage.js';
import Games from './Games.js';
import Collectibles from './Collectibles.js';
import Header from './Header.js';
import ItemTab from './ItemTab.js';
import Footer from './Footer.js';
import Login from './Authentication/Login.js';
import Signup from './Authentication/SignUp.js';
import AdminPanel from './Admin/AdminPanel';
import GameDetailPage from './Items/GameDetailPage';
import NintendoGames from './Items/NintendoGames';
import XboxGames from './Items/XboxGames';
import PCGames from './Items/PCGames';
import PlaystationGames from './Items/PlaystationGames';
import Basket from './UserFunctions/Basket.js';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './Authentication/AuthContext';

function App() {
  const { user } = useAuth();
  return (

    <BrowserRouter>
      <div className="App">
        <Header />
        <ItemTab/>
        <div className="Body">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path='/:userId/basket' element={<Basket/>}/>

            <Route path="/Games" element={<Games />} />
            <Route path='/Games/Nintendo' element={<NintendoGames/>}/>
            <Route path='/Games/Playstation' element={<PlaystationGames/>}/>
            <Route path='/Games/Xbox' element={<XboxGames/>}/>
            <Route path='/Games/Pc' element={<PCGames/>}/>
            <Route path="/Games/:platform/:gameId" element={<GameDetailPage />} />

            <Route path="/Collectibles" element={<Collectibles />} />
            <Route path="/Collectibles/Pops" element={<Collectibles />} />
            <Route path="/Collectibles/Amiibo" element={<Collectibles />} />
            <Route path="/Collectibles/Figures" element={<Collectibles />} />

            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            {user && user.role ? (<>
              <Route path="/admin-panel" element={<AdminPanel />} />
            </>) : (null)}
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

