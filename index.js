const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//MiddleWare
app.use(express.json());
const cors = require("cors");
app.use(cors());
const port = process.env.PORT || 5000;
require("dotenv").config();


//Jwt token 
const jwt = require('jsonwebtoken');



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xf2yx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const varifyJWT = (req, res, next) => {
  const userAuth = req.headers.authorization;
  if (!userAuth) {
    return res.status(401).send({ message: 'Unauthorizaed User' });
  }
  const token = userAuth.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_JWT_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    req.decoded = decoded;
    next();
  });


}




async function run() {
  try {
    await client.connect();
    const healthCollection = client.db("HealthServices").collection("healthData");
    const bookingCollection = client.db("bookingServices").collection("bookData");
    const userCollection = client.db("allUser").collection("user");
    console.log('Database Connceted');


    //Load All Services
    app.get('/allServices', async (req, res) => {
      const service = await healthCollection.find({}).toArray();
      res.send(service);
    })

    //Booking Services
    app.post('/bookingOrder', async (req, res) => {
      const booking = req.body;
      const orders = await bookingCollection.insertOne(booking);
      res.send(orders);
    })


    //My Services 
    //User Booking Order 
    app.get('/myServices', varifyJWT, async (req, res) => {
      const email = req.query.email;
      const decoded = req.decoded.email;
      if (email === decoded) {
        const query = { email: email }
        const book = await bookingCollection.find(query).toArray();
        return res.send(book)
      }
      else {
        return res.status(403).send({ message: 'forbidden access' });
      }

    })


    //My Delete Services
    app.delete('/deleteOrder/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const deleteItem = await bookingCollection.deleteOne(filter);
      res.send(deleteItem);
    })

    //All Booking Services
    app.get('/allBookingOrder', async (req, res) => {
      const booking = await bookingCollection.find({}).toArray();
      res.send(booking);
    })

    //Load All User 
    app.get('/allAdmin', varifyJWT, async (req, res) => {
      const admin = await userCollection.find({}).toArray();
      res.send(admin);
    })

    //Register and social media user save data in database
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user
      }
      const addUser = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_JWT_TOKEN, { expiresIn: '1h' });
      res.send({ addUser, token })
    })

    //Make Admin
    app.put('/user/admin/:email', varifyJWT, async (req, res) => {
      const email = req.params.email;
      const requesterEmail = req.decoded.email;
      const newAdmin = await userCollection.findOne({ email: requesterEmail });
      if (newAdmin.role === 'admin') {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: 'admin' }
        }
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
      else {
        return res.status(403).send({ message: 'forbidden access' });
      }

    })

    //Delete Admin 
    app.delete('/removeAdmin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    })


    //Check Admin 
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })




  }
  finally {

  }
}
run().catch(console.dir)


app.get("/", (req, res) => {
  res.send("Server is Working");
});

app.listen(port, () => {
  console.log("Server Start Successfully Done");
});
