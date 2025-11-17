import Home from './Home.js';
import Header from './Header.js';
import Footer from './Footer.js';
import './App.css';

function App() {
    return (

        <div style={AppStyle}>
          <Header />
          <div>
                <h1>hello</h1>
                <button>wow</button>
                <Home />
          </div>
          <Footer/>
        </div>
  );
}

export default App;

//oti einai style ki sta alla arxeia mporei na einai ki sta css arxeia 
// ta bazo etsi na katalabaino ti xreiazetai gia to site to vrisko pio aplo
const AppStyle = {
    tetxAlling: 'center',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
};
