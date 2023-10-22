import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
const app = express();
const port = 3000;

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, get } from "firebase/database";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyC5FbQl7TWhuQYGw4AWzHa-uYdVKHV2ts4",
    authDomain: "vigyan-69094.firebaseapp.com",
    projectId: "vigyan-69094",
    storageBucket: "vigyan-69094.appspot.com",
    messagingSenderId: "32379019984",
    appId: "1:32379019984:web:0af45c5f6348cc487a34d5",
    measurementId: "G-TE9SNXT3S4",
    databaseURL: "https://vigyan-69094-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialise Firebase
const fbapp = initializeApp(firebaseConfig);
const database = getDatabase(fbapp);

app.use(morgan('dev'));
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

// Endpoints

app.get('/', (req, res)=>{
    get(ref(database, '/')).then((snapshot)=>{
        if(snapshot.exists()){
            console.log("Data fetched for /");
            res.json(snapshot.val());
        }else{
            console.log("No data available");
        }
    }).catch((error) => 
        console.log(error)
    );
});

// Start the Server
app.listen(port, ()=>{
    // write data
    // set(ref(database, 'users/'), {
    //     username: "aarifkhan",
    //     password: "abcd1234"
    // });

    console.log("OK");
})