
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT ||5000;
//1. env setup
//2.middleware setup
//3.install cors,express.js,mongodb for resource sharing
//4.request information (req,res)
//5.npm install express

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rrnpcbx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//6.jwt set in login system and reviews system
function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if(err){
           return res.status(403).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })

}   

async function run(){
 
try{
const serviceCollection = client.db('onlineBookStores').collection('services')
const reviewCollection = client.db('onlineBookStores').collection('reviews')

app.post('/jwt',(req,res) =>{
    const user = req.body;
    const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '1d'} )
    res.send({token})
})

//7.get all services in database to client side
app.get('/services', async(req,res) =>{
    const query = {};
    
    const cursor =serviceCollection.find(query)
    const services = await cursor.toArray();
    res.send(services);
});

app.get('/services/:id', async(req,res) =>{
    const id= req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query)
    res.send(service)
});

//8.review api

 app.get('/reviews', verifyJWT, async(req,res) =>{
    
    const query= {};
    const cursor = reviewCollection.find(query)
    const result = await cursor.toArray();
    res.send(result);
 });   

app.post('/reviews', async(req,res) =>{
    const review = req.body;
    const result = await reviewCollection.insertOne(review);
    res.send(result);
});

app.delete('/reviews/:id', async(req,res) =>{
    const id= req. params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewCollection.deleteOne(query)
    res.send(result)
    
});



}
finally{

}


}
run().catch(error =>console.error(error))





app.get('/', (req, res) =>{
    res.send('online bookstore server is running')
})

app.listen(port, () =>{
    console.log(`online bookstore server running on ${port}`)
})