const UserCollection = require("../models/user");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Message = require('../models/message');
require("dotenv").config();
exports.signuppage = (req, res) => {
  res.render("signup");
};
exports.loginpage = (req, res) => {
  res.render("login");
};

const nodemailer = require("nodemailer");
const otpStore = {}; // Temp store (for demo)

//  Send OTP
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  console.log("Email:", email);

  if (!email) return res.status(400).send("Email required");
  const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit
  otpStore[email] = otp;
console.log(otp);
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

  const mailOptions = {
    from: "yourgmail@gmail.com",
    to: email,
    subject: "Your OTP for Signup",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send("OTP sent");
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).send("Failed to send OTP");
  }
};

//  Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] == otp) {
    delete otpStore[email];

    //  Save email to DB (temporary user creation with only email)
    let user = await UserCollection.findOne({ email: email }); 

    if (!user) {
      await UserCollection.create({
        name: "Temp", // placeholder
        email: email,
        password: "Temp", // placeholder
        dp: "default.png"
      });
      
    }

    return res.send("success");
  } else {
    return res.status(400).send("Invalid or expired OTP");
  }
};

exports.signup = async (req, res) => {
  const { name, password } = req.body;
  const email = req.body.email; 
  const dp = req.file;

  if (!name || !email || !password) {
    return res.status(400).send("Please fill all fields");
  }
console.log(email);
  const user = await UserCollection.findOne({ email: email });

  if (!user) {
    return res.status(404).send("OTP not verified or user not found");
  }
console.log(" email pass",email,password);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  //  Update the existing user
  user.name = name;
  user.password = hashedPassword;
  user.dp = dp ? dp.filename : "default.png";

  await user.save();
  console.log("User fully registered!");
  res.redirect("/");
};


exports.login = async(req, res) => {
  const data={
    email:req.body.email,
    password:req.body.password
  }
const existing = await UserCollection.findOne({ email: data.email });
console.log(existing);
if (existing) {
    const isMatch = await bcrypt.compare(data.password, existing.password);
    if (isMatch) {
        console.log("Login successful!");
        req.session.user = existing;
        res.redirect("/home");
    } else {
        console.log("Password galat hai!");
        res.status(400).send("Incorrect password");
    }
} else {
    console.log("email galat hai!");
    res.status(400).send("email not found");
}
};

exports.home = async (req, res) => {
  const currentUser = req.session.user;

  if (!currentUser) {
    return res.redirect("/login");
  }

  const contacts = await UserCollection.find({ _id: { $ne: currentUser._id } });

  res.render("home", {
    user: currentUser,
    contacts: contacts
  });
};


exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Internal server error");
    }
    res.redirect("/login");
  });
};

exports.sendMessageSocket = async (req, res) => {
    const from = req.session.user._id;
    const to = req.body.to;
    const text = req.body.message;

    let media = null;
    let mediaType = null;

    if (req.file) {
        media = req.file.filename;
        const mime = req.file.mimetype; // like image/png, video/mp4
        if (mime.startsWith('image/')) {
            mediaType = 'image';
        } else if (mime.startsWith('video/')) {
            mediaType = 'video';
        }
        console.log("Media type:", mediaType);
    }

    const newMsg = await Message.create({
        sender: from,
        receiver: to,
        text,
        media
    });

    res.json({
        from,
        to,
        name: req.session.user.name,
        message: text,
        media,
        mediaType
    });
};



exports.getchat = async(req, res) => {
    const contactId = req.params.id;
    const currentUser = req.session.user;

    if (!currentUser) {
        return res.status(401).send("Unauthorized");
    }

    // Find the chat user
    const chatUser = await UserCollection.findById(contactId);

    // Find all messages between currentUser and chatUser
    const messages = await Message.find({
        $or: [
            { sender: currentUser._id, receiver: contactId },
            { sender: contactId, receiver: currentUser._id }
        ]
    });

  res.render('partials/chat-box', {
    user: currentUser,
    chatUser,
    messages
  });
};
