//require modules
const express = require("express");
const bodyParser = require("body-parser");
const { FingerprintJsServerApiClient, Region } = require('@fingerprintjs/fingerprintjs-pro-server-api');
const  FingerprintJS =require('@fingerprintjs/fingerprintjs-pro');

// Initialize an agent at application startup.
// const fpPromise = FingerprintJS.load({ apiKey: 'your-public-api-key' })

// Get the visitor identifier when you need it.
// fpPromise
//   .then(fp => fp.get())
//   .then(result => console.log(result.visitorId))
// Init client with the given region and the secret api_key
const clientF = new FingerprintJsServerApiClient({region: Region.Global, apiKey: "mhvKGtvOrTg6eDiLLO3c"});

// Get visitor history

const port = process.env.PORT || 3000;
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://siddhant:2XdDHhCq1ucbkr0Z@edd.looccft.mongodb.net/Mindscript?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//aquire express in app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//allow app to use public folder to load html and css
app.use(express.static("public", { "extensions": ["html", "css"] }));

//home route
app.get('/', async function (req, res) {
  res.sendFile('/index.html', { root: 'public' });
});

//signup route
app.get("/signup", async function (req, res) {
  res.sendFile("/signup.html", { root: "public" });
});

//login route
app.get("/login", async function () {
  res.sendFile("/login.html", { root: "public" });
});

//take user data from signup page 
app.post("/signup", async function (req, res) {
  try {
    const userData = req.body;
    // Connect to the MongoDB cluster
    await client.connect();
    if (userData.password.length < 8) {
      res.sendFile("/signup.html", { root: "public" });
    }
    else {
      try {
        // Select the database and collection
        const database = client.db('Mindscript');
        const collection = database.collection('UserCredentials');
        const query = { email: userData.email };
        const result = await collection.find(query).toArray();
        if (result.length === 0) {
          const insertResult = await collection.insertOne(userData);
          res.sendFile("/login.html", { root: "public" });
        }
        else {
          console.log("account already exists");
          res.sendFile("/signup.html", { root: "public" });
        }
      } catch (err) {
        console.error(err);
      }
    }
    await client.close();
  }
  catch (error) {
    console.error(error);
  };
});

//check login data while signup
app.post("/login", async function (req, res) {
  const userData = req.body;
  try {
    await client.connect();
    const database = client.db('Mindscript');
    const collection = database.collection('UserCredentials');
    const query = { email: userData.email };
    const result = await collection.find(query).toArray();
    if (result.length === 0) {
      console.log("No account exists with that email .Create new account or login with other email ");
      res.sendFile("/login.html", { root: "public" });
    }
    else {
      if (result[0].password == userData.password) {
        console.log(result[0].visit);
        console.log(userData.visit);
        if (result[0].visit!= userData.visit) {
          console.log("Login with same device you sign up with");
          res.sendFile("/login.html", { root: "public" });
        }
        else {
          res.sendFile("/success.html", { root: "public" });
        }
      }
      else {
        console.log("Wrong password entered");
        res.sendFile("/login.html", { root: "public" });
      }
    }
    await client.close();
  }
  catch (err) {
    console.error(err);
  }
});

//listen on port
app.listen(port, function () {
  console.log("successfully launched server");
});

