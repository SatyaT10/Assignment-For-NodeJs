const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const nodemailer = require('nodemailer');
const Post = require('../models/postModel');

const securePassword = async (password) => {
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword;
    } catch (error) {
        console.log(error.message);
    }
}

const matchPassword = async (password, userData) => {
    try {
        const isMatchPassword = await bcrypt.compare(password, userData.password);
        return isMatchPassword;
    } catch (error) {
        console.log(error.message);
    }
}

const createToken = async (data) => {
    try {
        const userData = {
            username: data.username,
            userId: data._id,
            email: data.email
        }
        const token = jwt.sign({ userData }, config.secret_jwt, { expiresIn: "2h" });
        return token;
    } catch (error) {
        console.log(error.message);
    }
}

const sendForgetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.Username,
                pass: config.Password
            }
        });
        const mailOptions = {
            from: config.hostEmail,
            to: email,
            subject: 'Forget Password Mail',
            html: '<p>Hii, ' + name + ' Please take token for forget your password:-  ' + token + ' ></p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}


const insertUser = async (req, res) => {
    try {
        const { name, username, password, email, mobile } = req.body;
        if (!name || !username || !password || !email || !mobile) return res.status(400).json({ success: false, message: "Please fill all the requried fields!" });

        const isExist = await User.findOne({ email: email });
        const isExistUsername = await User.findOne({ username: username });
        const newPassword = await securePassword(password);

        if (!isExist) {
            if (!isExistUsername) {
                await User.create({
                    name: name,
                    username: username,
                    password: newPassword,
                    email: email,
                    mobile: mobile
                })
                res.status(200).json({ success: true, message: "User Registration successfully" });
            } else {
                res.status(400).json({ success: false, message: "You are alreadey exists you can login with your username or password" });
            }

        } else {
            res.status(400).json({ success: false, message: "You are alreadey exists you can login with your username or password" });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        console.log(req.body);
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: "Please fill all the requried fields!" });
        const isExist = await User.findOne({ username: username });
        if (isExist) {
            const isMatch = await matchPassword(password, isExist);
            if (isMatch) {
                const token = await createToken(isExist);
                res.status(200).json({ success: true, message: "User Login successfully", token: token });
            } else {
                res.status(400).json({ success: false, message: "username or password is wrong!" });
            }
        } else {
            res.status(400).json({ success: false, message: "username or password is wrong!" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Please fill all the required fields!" });
        const isExist = await User.findOne({ email: email });
        if (isExist) {
            const token = await createToken(isExist)
            await sendForgetPasswordMail(isExist.username, isExist.email, token);
            res.status(200).json({ success: true, message: "Please check your email for token to your reset password " });
        } else {
            res.status(400).json({ success: false, message: "You are not a register user please do registation first!" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


const setPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ success: false, message: "Please fill all the required fields!" });
        const userData = req.user.userData;
        const isExist = await User.findOne({ email: userData.email });
        if (isExist) {
            const newPassword = await bcrypt.hash(password, 10);
            await User.findOneAndUpdate({ email: isExist.email }, { $set: { password: newPassword } })
            res.status(200).json({ success: true, message: "Password reset successfully!", userData: isExist });
        } else {
            res.status(400).json({ success: false, message: "You are not a register user please do registation first!" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


const createPost = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { title, content, description } = reqBody
        if (!title || !content || !description) return res.status(400).json({ success: false, message: "Please fill all the required fields!" });
        const postData = await Post.create({
            CreaterId: userData.userId,
            title: title,
            content: content,
            description: description
        })
        res.status(200).json({ success: true, message: "Post created successfully!", post: postData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


const updatePost = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { title, content, description, postId } = reqBody
        if(!title||!content||!description||!postId) return res.status(400).json({success:false,message:"fill all the requried fields!"})

        const isPost = await Post.findOne({ _id: postId })
        if (isPost) {
            const isYourPost = await Post.findOne({ _id: postId, CreaterId: userData.userId })
            if (isYourPost) {
                const postData = await Post.findOneAndUpdate(
                    {
                        _id: postId
                    }
                    ,
                    {
                        $set:
                        {
                            title,
                            content,
                            description

                        }
                    },{new:true}
                )
                res.status(200).json({ success: true, message: "Post updated successfully!", post: postData });

            } else {
                res.status(400).json({ success: false, message: "This is not Your Post!" });
            }
        } else {
            res.status(400).json({ success: false, message: "Post not found!" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const viewAllPost = async (req, res) => {
    try {
        const postData = await Post.find({})
        if (postData) {
            res.status(200).json({ success: true, message: "Post found successfully!", post: postData });
        } else {
            res.status(400).json({ success: false, message: "Post not found!" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


const viewMyPost = async (req, res) => {
    try {
        const userData = req.user.userData;
        const postData = await Post.find({ CreaterId: userData.userId })
        if (postData) {
            res.status(200).json({ success: true, message: "Post found successfully!", post: postData });
        } else {
            res.status(400).json({ success: false, message: "Post not found!" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const deleteMyPost = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { postId } = reqBody
        if (!postId) return res.status(400).json({ success: false, message: "Please fill all the required fields!" });
        const isPost = await Post.findOne({ _id: postId })
        // console.log(isPost);
        if (isPost) {
            const isYourPost = await Post.findOne({ _id: postId, CreaterId: userData.userId })
            if (isYourPost) {
                await Post.findOneAndDelete({
                    _id: postId, CreaterId: userData.userId
                })
                res.status(200).json({ success: true, message: "Post deleted successfully!" });
            } else {
                res.status(400).json({ success: false, message: "This is not Your post. you can't delete this!" });
            }
        } else {
            res.status(400).json({ success: false, message: "Post not found!" });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const likePost = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { postId } = reqBody;
        if(!postId) return res.status(400).json({success:false,message:"please provide all the requried fill!"})
        const isPost = await Post.findOne({ _id: postId })
        console.log(isPost);
        if (isPost) {
            isPost.likes.forEach((userId) => {
                if (userId == userData.userId) res.status(400).json({ success: false, message: "You already liked this post" });
            })
            await Post.findOneAndUpdate({ _id: postId }, { $push: { likes: userData.userId } })
            res.status(200).json({ success: true, message: "You liked this post" });
        } else {
            res.status(400).json({ success: false, message: "Post not found!" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const commentPost = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { comment, postId } = reqBody;
        if(!comment||!postId) return res.status(400).json({success:false,message:"please fill all the required filds!"})
        const isPost = await Post.findOne({ _id: postId })
        if (isPost) {
            await Post.findOneAndUpdate({ _id: postId }, { $push: { comments: { comment: comment, userId: userData.userId } } })
            res.status(200).json({ success: true, message: "You have comment this post" });
        } else {
            res.status(400).json({ success: false, message: "Post not found!" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = {
    insertUser,
    loginUser,
    forgetPassword,
    setPassword,
    createPost,
    viewAllPost,
    viewMyPost,
    updatePost,
    deleteMyPost,
    likePost,
    commentPost
}
