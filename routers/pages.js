const { QuickDB } = require("quick.db");
const express = require('express');
const session = require('express-session');

const utils = require('../utils/helpers.js');
const config = require('../config');

const router = express.Router();
var db = new QuickDB();

router.use(session({
    secret: 'keyboard cat XDDDDDDDD soundenginebestratjebiecimatkeelo',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

router.get('/', async (req, res) => {
    var isAdmin = await utils.isAdmin(req.session);
    await db.get(`timers`)
        .then((data) => {
            var timers = data.filter(t => t.private == false);
            return res.render('index', {session: req.session, timers: timers, isAdmin: isAdmin, config: config});
        })
        .catch((err) => {
            console.error(err);
            return res.render('index', {session: req.session, timers: "error", isAdmin: isAdmin, config: config});
        });
});

router.get('/login', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.render('login', {session: req.session, config: config, redirect: req.query.redirect || "/"});
    return res.redirect('/');
});

router.get('/register', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.render('register', {session: req.session, config: config});
    return res.redirect('/');
});

router.get('/user', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.redirect('/login?redirect=/user');
    var isAdmin = await utils.isAdmin(req.session);

    await db.get(`timers`)
        .then((data) => {
            var timers = data.filter(t => t.username == req.session.username).sort((a, b) => a.created - b.created);
            return res.render('user', {session: req.session, username: null, timers: timers, isAdmin: isAdmin, config: config});
        })
        .catch((err) => {
            console.error(err);
            return res.render('user', {session: req.session, username: null, timers: "error", isAdmin: isAdmin, config: config});
        });
});

module.exports = router