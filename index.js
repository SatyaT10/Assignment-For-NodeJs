const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRouter = require('./routes/userroutes');
const cors = require('cors');

mongoose.connect('mongodb://127.0.0.1:27017/User-Management-System').then(() => {
    console.log("Database Connected!");
}).catch((err) => {
    const error = new Error("Database Connection Failed!");
    next(error)
})
const PORT = 8080;

app.use('/api', userRouter);
app.use(cors());

app.get('*', (req, res, next) => {
    var err = new Error('page Not Found');
    next(err)
})
app.post('*', (req, res, next) => {
    var err = new Error('Oops page Not Found');
    next(err)
})

app.use((err, req, res, next) => {
    res.status(500).send({ success: false, message: err.message })
})


app.listen(PORT, () => console.log(`Server is listening successfully on port ${PORT}!`))
