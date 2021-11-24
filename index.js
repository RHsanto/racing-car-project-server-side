const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors')
const app =express();
const port = process.env.PORT || 8000;

//midalware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bhafc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

  try {
    await client.connect();
    const database = client.db("motorcycles");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders")
    const usersCollection = database.collection("users")
    const database2 = client.db("allReviews")
    const reviewsCollection = database2.collection("reviews");

  //ADD ORDERS COLLECTION 
    app.post('/orders', async (req,res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.json( result)
    })

  // GET API ALL ORDERS
        app.get('/saveorders', async (req,res)=>{
          const cursor = ordersCollection.find({})
          const orders = await cursor.toArray();
          res.send(orders);
    
         });


    // GET API PRODUCTS
   app.get('/saveproducts', async (req,res)=>{
    const cursor = productsCollection.find({});
    const offers = await cursor.toArray();
    res.send(offers);

   });

  //  // GET SINGLE PRODUCT
   app.get('/products/:id', async (req,res)=>{
     const id = req.params.id;
     const query = {_id: ObjectId(id)};
     const booking = await productsCollection.findOne(query)
   res.json(booking);
   });

    ////POST API ORDERS
    app.post('/products', async (req,res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json( result)
    })

   

  // GET LOGGED USER ORDERS
    app.get('/orders/:email', async (req,res)=>{
      const result = await ordersCollection.find({email: req.params.email}).toArray();
      res.json(result)
    })


 // GET API REVIEWS
 app.get('/savereviews', async (req,res)=>{
  const cursor = reviewsCollection.find({});
  const reviews = await cursor.toArray();
  res.send(reviews);

 });
 
  //POST API ORDERS
  app.post('/reviews', async (req,res) => {
    const reviews = req.body;
    const result = await reviewsCollection.insertOne(reviews);
    res.json( result)
  })

  // Here all user  api
  app.post('/users', async (req,res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.json( result)
  })

 //Here put google login info
   app.put('/users',async (req,res)=>{
     const user = req.body;
     const filter={email:user.email};
     const options = {upsert : true};
     const updateDoc = {$set : user};
     const result = usersCollection.updateOne(filter,updateDoc,options);
     res.json(result)
   })

 //Here put make admin  info
   app.put('/users/admin',async (req,res)=>{
     const user = req.body;
     const filter={email:user.email};
     const updateDoc = {$set :{role : 'admin'}};
     const result = await usersCollection.updateOne(filter,updateDoc);
     res.json(result)
   })

  // here admin   api
  app.get('/users/:email', async (req,res) => {
    const email = req.params.email;
    const query = {email:email};
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if(user?.role === 'admin'){
      isAdmin = true;
    }
    res.json( {admin:isAdmin})
  })



  //DELETE API ORDERS
    app.delete('/orders/:id', async(req,res)=>{
      const id     = req.params.id;
      const query  = {_id:ObjectId(id)} ;
      const result = await ordersCollection.deleteOne(query)
      res.json(result);
     })

     // UPDATE STATUS 
     app.put('/orders/:id', async(req,res)=>{
       const id = req.params.id;
       const filter ={_id: ObjectId(id)}
       const option = {upsert : true};
       const updateStatus ={
         $set:{
           status: 'Approved',
         },
       };

       const result = await ordersCollection.updateOne(filter,updateStatus,option);
       res.json(result)
     })



   
  } finally {
   // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
  res.send('Running the server on heruku');
})
app.listen(port, () => {
  console.log('Example app listening at',port)
})
