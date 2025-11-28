const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

app.use(express.json());

app.post('/api/login', (req, res) => {
    const {email, password} = req.body;

    if(email === "test@gmail.com" && password =="1234") {
        return res.json({
            success: true,
            message: "Logged in :)",
            token: "1234567890"
        });
    }else{
        return res.status(401).json({
            success: false,
            message: "email or password is wrong dude :/"
        });
    }
});

app.listen(port, () =>{
    console.log('Server listening at http://localhost:'+port);
});