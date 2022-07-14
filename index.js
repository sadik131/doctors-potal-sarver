const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const ports = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');


// midell wer
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASSWORD}@cluster0.jdsxm.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

// const VeryfyJWT = (req , res , next)=>{
//     const authorization = req.headers.authorization
//     if(!authorization){
//         res.status(401).send({message: "UnAuthorization access"})
//     }
//     const token = authorization.split(" ")[1]
//     jwt.verify(token, process.env.Access_token, function(err, decoded) {
//         if(err){
//             res.status(403).send({message:"forbiden access"})
//         }
//         console.log("decoded",decoded);
//         req.decoded = decoded
//         next()
//       });
// } 

async function run() {
    try {
        await client.connect()
        const sarviseCollection = client.db("doctor-potal").collection("sarvises")
        const appointmentCollection = client.db("doctor-potal").collection("appointment")
        const usersCollection = client.db("doctor-potal").collection("user")

        //all sarvises
        app.get("/sarvises", async (req, res) => {
            const result = await sarviseCollection.find().toArray()
            res.send(result)
        });

        // post a appointment for par user 
        app.post("/appointment", async (req, res) => {
            const data = req.body
            const quarry = { tritment:data.tritment , date: data.date }
            const exist = await appointmentCollection.findOne(quarry)
            console.log(exist);
            if (exist) {
                return res.send({ success: false, message: exist })
            }
            else {
                const result = await appointmentCollection.insertOne(data)
                return res.send({ success: true, message: data.slot })
            }
        });

        //get the user Appointment
        app.get('/booking' , async(req , res) =>{
            const user = req.query.patients
            const query = {user}
            const result = await appointmentCollection.find(query).toArray() 
            res.send(result)
        });

        //get all appointment 
        app.get("/appointment" , async(req , res) =>{
            const result = await appointmentCollection.find().toArray()
            res.send(result)
        });

        //get all users
        app.post("/users/:email", async(req , res) =>{
            const email = req.params.email
            const user = req.body 
            const filter = {email}
            const options = { upsert: true };
            const updateDoc = {
                $set:user
            
        }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({email} , process.env.Access_token ,{ expiresIn: '1h' })
            res.send({result , accessToken: token})
        });

        // make user to admin
        app.post("/users/admin/:email",  async(req , res) =>{
            const email = req.params.email
            const filter = {email}
                const updateDoc = {
                    $set:{roll:"admin"}
                }
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.send(result)
            }
        );

        //get all user
        app.get("/user", async(req , res) =>{
            const user = await usersCollection.find().toArray()
            // console.log(req.decoded.email);
            res.send(user)
        })
    }
    finally {

    }
}

run().catch(console.dir)
//root

app.get("/", (req, res) => {
    res.send("hello world")
})

app.listen(ports, () => {
    console.log(`web is lisening on ${ports}`)
})