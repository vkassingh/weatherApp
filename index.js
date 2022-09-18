const express= require('express');
const fetch= require('node-fetch');
const bodyParser= require('body-parser');
const mongoose= require('mongoose');
require('dotenv').config();
// import express from 'express';
// import fetch from 'node-fetch';
// import bodyParser from 'body-parser';
// import mongoose from 'mongoose'


const app= express();

// middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


//mongoose schema
const weatherSchema= mongoose.Schema({
    city: String,
    temp: Number,
    des: String,
    date: {
        type: Date,
        default: Date.now
    },
});

const Weather =mongoose.model("Weather", weatherSchema);

//connect with mongodb database
mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

mongoose.connection.on('error', error=>{
    console.log("connection failed");
})

mongoose.connection.on('connected', connected=>{
    console.log("connected with db");
})


//handle get request 
app.get('/', (req, res)=>{
    res.render('index' , {city: null, des:null, temp: null});
});

//handle post request
app.post('/', async (req, res) => {
    let city = req.body.city;
    let url= `https://api.weatherapi.com/v1/current.json?key=${process.env.API_KEY}&q=${city}&aqi=no`;
    console.log(url)
        await fetch(url)
        .then(res => res.json())
        .then(data => {
             console.log(data.location.name);
             console.log(data.current.temp_c) ;
             console.log(data.current.condition.text);
             
             let city= data.location.name;
             let temp= data.current.temp_c;
             let des= data.current.condition.text;

             res.render('index', {city: city, temp: temp, des: des})

             //save data from api to db 
             const weatherData= new Weather({
                city: data.location.name,
                temp: data.current.temp_c,
                des: data.current.condition.text,
              });
  
              weatherData.save();
  
            })


        });
            
            Weather.find({}, function(err, weather){
                if (err) console.log(err);
                console.log(weather);
                result = weather;
            })
        


 
const port= process.env.PORT || 5000;
app.listen(port, (req, res)=>{
    console.log('http://127.0.0.1:'+ port);
});