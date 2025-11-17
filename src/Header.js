export default function Header(){
    return (
        <header style={headerStyle}>
            <h1 style={TitleStyle}>Brasidas Store HD</h1>
            <left>
                <button style={buttonStyle}>Sing up</button>
                <button style={buttonStyle}>Login</button>
            </left>
        </header>
    );
}

const headerStyle = {
    display: 'flex',    //eidikos antonis
    justifyContent: 'space-between',
    backgroundColor: '#346eeb', // blue alla eidiko blue
    color: 'white',
    padding: '5px',     //the height of header
    textAlign: 'left',
    margin: '0px',
};

const TitleStyle = {
    fontSize: '25px',
    margin: '5px',
};

const buttonStyle = {
    padding: '7px 10px',      // button size
    backgroundColor: 'white', // Button background
    color: 'black',         // Button text color
    cursor: 'pointer',        // Change cursor to pointer when hovering over button
    borderRadius: '5px',      // Rounded corners for the button
    margin: '2px',          //distance between buttons
};
