const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRouter = require('./routes/userroutes');

mongoose.connect('mongodb://127.0.0.1:27017/User-Management-System').then(() => {
    console.log("Database Connected!");
}).catch((err) => {
    const error = new Error("Database Connection Failed!");
})
const PORT = 8080;

app.use('/api',userRouter);

app.listen(PORT, () => console.log(`Server is listening successfully on port ${PORT}!`))