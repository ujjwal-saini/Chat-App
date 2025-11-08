const express=require("express");
const Router=express.Router();
const control=require("../controllers/control")
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

Router.post("/send-otp", control.sendOTP);
Router.post("/verify-otp", control.verifyOTP);


Router.get("/", control.loginpage);
Router.get("/signup", control.signuppage);
Router.get("/login", control.loginpage);

Router.post("/signup",upload.single("dp"), control.signup);
Router.post("/login", control.login);

Router.get("/home", control.home);
Router.post("/logout", control.logout);


express.json();

Router.post('/send-message-socket', upload.single("media"), control.sendMessageSocket);

Router.get("/get-chat/:id", control.getchat);


module.exports = Router;