const express=require('express');  // importing express using require
const app = express(); //Creating an instance of express
const fs = require('fs')
const cors = require('cors');
const axios = require('axios')

var contributorData = []
Promise.all([axios.get("https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.json")])
.then(async response => {
    contributorData =  response[0].data;


}).catch(error => {
    fs.readFile(__dirname + '/data/owid-co2-data.json',"utf8",  (err, data) => {
        contributorData = data;
    });

});

app.get('/',(req,res)=> res.send('<h2 style="margin:2rem"> Welcome to Homepage</h2>'))

app.get("/co2-emission", cors(),(req, res) => {
    let customCo2DatasetArray = []
    fs.readFile(__dirname + '/data/CO2_EmissionClean.json',"utf8",  (err, data) => {
        let mainDataSet  = JSON.parse(data)
        var unique = (src, fn) => src.filter((s => o => !s.has(fn(o)) && s.add(fn(o)))(new Set));
        let filteredYears = unique(mainDataSet, (data) => data.Year)
        let tempArr = []
        for (let i = 0; i< filteredYears.length; i++) {
            if(filteredYears[i].Year !== null) tempArr.push(filteredYears[i].Year);
        }
        tempArr.map(elementDate => {
            var filteredEvents = mainDataSet.filter(function(event){
                return event.Year == elementDate;
            });
            customCo2DatasetArray.push({date: elementDate, countryList:filteredEvents})
        })
        res.send(customCo2DatasetArray);
    })
});


app.get("/contributors", cors(),(req, res) => {
        res.send(contributorData);
});


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

const port = process.env.PORT || 3000 //First inititalizing the port

app.listen(port,()=>  console.log(`Express is listening on port:${port}`))
