const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//MiddleWare
app.use(express.json());
const cors = require("cors");
app.use(cors());
const port = process.env.PORT || 5000;
require("dotenv").config();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xf2yx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
  const healthCollection = client.db("HealthServices").collection("healthData");
  const bookingCollection = client.db("bookingServices").collection("bookData");
  console.log('Database Connceted');



  //All Service Read 
  app.get('/allServices', (req, res) => {
    healthCollection.find({}).toArray()
      .then(result => {
        res.send(result)
      })
  })

  //Get Single Items 
  app.get('/orders/:id', (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) }
    bookingCollection.findOne(query)
      .then(result => {
        res.send(result);
      })
  })



  //Get Booking Data From MongoDB
  app.get('/allOrder', (req, res) => {
    const email = req.query.email;
    const newQuarey = { email };
    bookingCollection.find(newQuarey).toArray()
      .then(result => {
        res.send(result)
      })
  })

  //Get All Booking Data From MongoDB
  app.get('/findAllOrders', (req, res) => {
    bookingCollection.find({}).toArray()
      .then(result => {
        res.send(result)
      })
  })



  //Booking Post in MongoDB
  app.post('/bookServices', (req, res) => {
    const booking = req.body;
    bookingCollection.insertOne(booking)
      .then(result => {
        res.send(result)
      })

  })


  //Booking Delete From MongoDB
  app.delete('/orderDelete/:id', (req, res) => {
    const removeId = req.params.id;
    const removeOrder = { _id: ObjectId(removeId) };
    bookingCollection.deleteOne(removeOrder)
      .then(result => {
        res.send(result);
      })
  })









});













app.get("/", (req, res) => {
  res.send("Server is Working");
});

app.listen(port, () => {
  console.log("Server Start Successfully Done");
});
