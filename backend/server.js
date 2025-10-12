const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

app.use(express.json());
app.use(cors({
    origin: '*'
}));
const authroutes = require("./Routes/arogya");

app.listen(PORT || 3000,()=>{
    console.log("server started");
  
})


app.get('/', (req, res) => {
    res.send('Hello, this is Wallet App api!');
});
