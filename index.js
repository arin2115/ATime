const { QuickDB } = require("quick.db");
var express = require('express');
var config = require('./config');
var utils = require('./utils/helpers');
var session = require('express-session');
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
app.use('/timer', timers);

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

async function init() {
    await utils.initMail();
    if (!await db.get(`timers`)) await db.set(`timers`, []);
    await db.set(`email_${Buffer.from(config.admin.email, 'utf-8').toString('base64')}`, {username: config.admin.username});
    await db.set(`user_${config.admin.username}`, {username: config.admin.username, email: Buffer.from(config.admin.email, 'utf-8').toString('base64'), password: utils.hash(config.admin.password), admin: true, verified: true, verificationCode: ""});    
}

init();

app.get('*', function(req, res){
    res.send("Czego tutaj szukasz?? <button onclick=\"window.location.href='/'\">strona główna</button>");
});

let server = app.listen(5479, () => console.log('ATime listening on port 5479!'));