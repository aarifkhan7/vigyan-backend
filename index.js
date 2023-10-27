import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import nocache from "nocache";
const app = express();
const httpServer = createServer(app);
const socketio = new Server(httpServer, { 
    cors:{
        origin: [
            "http://127.0.0.1:5500",
	        "http://localhost:3001",
            "https://vigyan-accidents.onrender.com"
        ],
        methods: ["GET", "POST"]
    }
});
const port = 3000;

const accountSid = process.env.twilioAccountSid;
const authToken = process.env.twilioAuthToken;
import twilio from 'twilio';

let smsClient = twilio(accountSid, authToken);

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push } from "firebase/database";

// Firebase Config
const firebaseConfig = {
    apiKey: process.env.firebaseApiKey,
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

app.use(nocache());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

// Check for token
// app.use((req, res, next)=>{
//     const token = req.body.token;
//     if(token != "wewillwin"){
//         console.log("Unauthorized Access.");
//         res.sendStatus(401);
//         res.end();
//     }else{
//         next();
//     }
// });

// Endpoints

app.get('/', (req, res)=>{
    // Get Data from Firebase
    get(ref(database, '/')).then((snapshot)=>{
        if(snapshot.exists()){
            console.log("Data fetched for /");
            res.setHeader('content-type', 'application/geo+json');
            res.json(snapshot.val());
        }else{
            console.log("No data available");
        }
    }).catch((error) => 
        console.log(error)
    );
});

app.post('/', async (req, res)=>{
    let lat = req.body.latitude;
    let lon = req.body.longitude;
    let dtype = req.body.type;
    if(lat == undefined || lon == undefined || dtype == undefined){
        res.sendStatus(400);
        res.end();
    }else{
        const currentFeatures = (await get(ref(database, '/features'))).val();
        const newInd = currentFeatures.length;
        console.log('Adding new Point at array index ' + newInd);
        // Write Data to Firebase
        const featureListRef = ref(database, 'features/' + newInd);
        set(featureListRef, {
            type: "Feature",
            properties: {
                type: dtype
            },
            geometry: {
                coordinates: [
                    lat,
                    lon
                ],
                type: "Point"
            }
        });
        res.sendStatus(200);
        res.end();
    }
});

app.post('/accident', (req, res)=>{
    let lat = req.body.latitude;
    let lon = req.body.longitude;
    if(lat == undefined || lon == undefined){
        res.sendStatus(400);
        res.end();
    }else{
        smsClient.messages
            .create({
                body: 'Accident detected at ' + lon + ", " + lat + '. View at http://maps.google.com/maps?z=12&t=m&q='+lon+','+lat,
                from: '+14093594897',
                to: '+919993883808'
            })
            .then(message => {
                console.log("SMS Sent: " + lon + ", " + lat + ": " + message.sid);
                res.sendStatus(200);
                res.end();
            }).catch(err => {
                console.log(err);
                res.sendStatus(500);
                res.end();
            });
        socketio.emit("accident", {
            latitude: lat,
            longitude: lon
        });
        console.log("Accident event emitted!");
    }
})

// Socket.io events
socketio.on("connection", (socket)=>{
    console.log("Socket Connected: " + socket.id);
})

// Start the Server
httpServer.listen(port, ()=>{
    console.log("OK");
})
