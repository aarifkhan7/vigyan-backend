const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const port = 3000;

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

// Check for token
app.use((req, res, next)=>{
    const token = req.body.token;
    if(token != "wewillwin"){
        console.log("Unauthorized Access.");
        res.sendStatus(401);
        res.end();
    }else{
        next();
    }
});

app.get('/', (req, res)=>{
    res.send("Hello, World!");
});

app.listen(port, ()=>{
    console.log("OK");
})