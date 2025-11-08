// app.js
const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Use socket logic from socket/socket.js
require("./socket/socket")(io); //  Pass io to the function

const path = require("path");
const session = require('express-session');
const router = require("./routes/route");

// DB and Models
require("./models/connection");
require("./models/user");

// Session
app.use(session({
  secret: 'ujjwalsaini',
  resave: false,
  saveUninitialized: false
}));

// Middleware
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use(router);

// Start server
server.listen(9000, () => {
  console.log(" Server is running on 9000 port");
});
