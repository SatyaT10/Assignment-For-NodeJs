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

userRoutes.post('/post/create-post',auth.verifyToken,userControllers.createPost);

userRoutes.post('/post/update-post',auth.verifyToken,userControllers.updatePost);

userRoutes.get('/post',userControllers.viewAllPost);

userRoutes.get('/post/mypost',auth.verifyToken,userControllers.viewMyPost);

userRoutes.post('/post/delete-post',auth.verifyToken,userControllers.deleteMyPost);

userRoutes.post('/post/like-post',auth.verifyToken,userControllers.likePost);

userRoutes.post('/post/comment-post',auth.verifyToken,userControllers.commentPost);

module.exports=userRoutes
