const express=require('express');
const userRoutes=express();
const userControllers=require('../controllers/userControllers');
const auth=require('../Middleware/auth');

userRoutes.use(express.json());
userRoutes.use(express.urlencoded({extended:true}));

userRoutes.post('/registration',userControllers.insertUser);

userRoutes.post('/login',userControllers.loginUser)

userRoutes.post('/forget-password',userControllers.forgetPassword)

userRoutes.post('/set-password',auth.verifyToken,userControllers.setPassword);

module.exports=userRoutes