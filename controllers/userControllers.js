const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const nodemailer = require('nodemailer');

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
            res.status(200).json({ success: true, message: "Password reset successfully!", userData:isExist});
        } else {
            res.status(400).json({ success: false, message: "You are not a register user please do registation first!" });
        }
    } catch (error) {
        res.status(400).json({success:false,message:error.message});
    }
}


module.exports = {
    insertUser,
    loginUser,
    forgetPassword,
    setPassword
}