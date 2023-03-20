const { QuickDB } = require("quick.db");
var express = require('express');
var config = require('./config');
var utils = require('./utils/helpers');
var socket = require("socket.io");
var session = require('express-session');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');

var app = express();
var db = new QuickDB();

// ROUTERS
const pages = require('./routers/pages');
const auth = require('./routers/auth');
const api = require('./routers/api');
const admin = require('./routers/admin');
const timers = require('./routers/timers');

app.use('/', pages);
app.use('/auth', auth);
app.use('/api', api);
app.use('/admin', admin);
app.use('/timers', timers);

// SETTINGS
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('trust proxy', 1)
app.use(session({
    secret: 'keyboard cat XDDDDDDDD soundenginebestratjebiecimatkeelo',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

// EMAIL
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.username,
      pass: config.email.password,
    },
});

async function init() {
    if (!await db.get(`timers`)) await db.set(`timers`, []);
    await db.set(`email_${Buffer.from(config.admin.email, 'utf-8').toString('base64')}`, {username: config.admin.username});
    await db.set(`user_${config.admin.username}`, {username: config.admin.username, email: Buffer.from(config.admin.email, 'utf-8').toString('base64'), password: utils.hash(config.admin.password), admin: true, verified: true, verificationCode: ""});    
    transporter.verify().then(console.log("Connected to email.")).catch(console.error);
}

init();

app.get('/users', async function(req, res){
    console.log(activeUsers);
    res.json(activeUsers);
});

let server = app.listen(5479, () => console.log('ATime listening on port 5479!'));

// SOCKETS
const io = socket(server, {
    cors: {
        origin: "http://localhost:5479",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    }, allowEIO3: true});

const activeUsers = [];

io.on("connection", function (socket) {
    socket.on("new user", function (data) {
        socket.userId = data.username;
        activeUsers.push(data);
        io.emit("new user", activeUsers);
    });

    socket.on("disconnect", () => {
        for (let i = 0; i <= activeUsers.length - 1; i++) {
            if (activeUsers[i].username == socket.userId) {
                activeUsers.splice(i, 1);
                io.emit("user disconnected", socket.userId);
            }
        }
    });
});

module.exports = transporter;