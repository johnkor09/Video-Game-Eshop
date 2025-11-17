export default function Footer() {
    return (
        <footer style={FooterStyle}>
            <h1 style={TextStyle}>Brasidas Store HD</h1>
            <h1 style={TextStyle}>Our team: AM:22390111, AM:22390022, AM:22390304, AM:22390232</h1>
        </footer>
    );

};

const FooterStyle = {
    backgroundColor: '#346eeb', // blue alla eidiko blue
    color: 'black',
    padding: '5px',     //the height of header
    textAlign: 'left',
    margin: '0px',

    //de xero an xreiazontai ola ayta
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',              // Full width
    marginTop: 'auto',
};

const TextStyle = {
    fontSize: '15px',
};