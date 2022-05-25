const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;


const corsConfig = {
    origin: true,
    credential: true,
  }
  app.use(cors(corsConfig))
  app.options('*', cors(corsConfig))
  app.use(express.json());
  
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttyvk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
      const tool = client.db('tool_store').collection('tool');
      const ordersCollection = client.db('tool_store').collection('orders');
      const reviewCollection = client.db('tool_store').collection('review');
      const usersCollection = client.db('tool_store').collection('users');

      // find all product from database
      app.get('/tool', async (req, res) => {
        const query = {};
        const cursor = tool.find(query);
        const tools = await cursor.toArray();
        res.send(tools);

        })


        // Add a new product to database collection
        app.post('/tool/', async (req, res) => {
            const product = req.body;
            const result = await tool.insertOne(product);
            res.json(result);
        })

        // find single product from database
        app.get("/tool/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = await tool.findOne(query);
            res.send(cursor);
        })

        // Add product to database collection
        app.post('/orders/', async (req, res) => {
            const product = req.body;
            const result = await ordersCollection.insertOne(product);
            res.json(result);
        })

        // find all order product from database
        app.get("/allorders/", async (req, res) => {
            const cursor = await ordersCollection.find({}).toArray();
            res.send(cursor);
        })

         // Find my orders from database
         app.get('/orders/', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const order = await ordersCollection.find(query).toArray();
            res.send(order);
        })

        // Delete a Single Order API 
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log(result);
        })

        // Delete a Single Product API 
        app.delete('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await jewelry.deleteOne(query);
            console.log(result);
        })

        // Update booking status
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "approved"
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            // console.log(id);
            res.json(result);
        })


         // Add review to database collection
         app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })

        // Find review to database collection
        app.get('/review/', async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
        })

        // New user save to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // Save google user data to database
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make an user to admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        // Check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Hello World")
})

app.listen(port, (req, res) => {
    console.log("Running with port: " + port);
})