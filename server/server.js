import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
const PORT=5000;
import connect from './config/db.js';
dotenv.config();

const app=express();

app.use(express.json());
app.get('/',(req,res)=>{
    res.send('Hello, World!');
});
connect();
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});