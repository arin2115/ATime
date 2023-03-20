const { QuickDB } = require("quick.db");
var db = new QuickDB();
const utils = require('../utils/helpers.js');
const express = require('express');
const router = express.Router();
const session = require('express-session');
var config = require('../config');

router.use(session({
    secret: 'keyboard cat XDDDDDDDD soundenginebestratjebiecimatkeelo',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

router.get('/', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.redirect('/login');
    var isAdmin = await utils.isAdmin(req.session);

    if (!isAdmin) return res.redirect('/');

    return res.render('admin/index', {session: req.session, isAdmin: isAdmin, config: config});
});

router.get('/users', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.redirect('/login');
    var isAdmin = await utils.isAdmin(req.session);

    if (!isAdmin) return res.redirect('/');

    await db.all()
        .then((data) => {
            var users = data.filter(u => u.id.startsWith("user_"));
            var emails = data.filter(u => u.id.startsWith("email_"));
            return res.render('admin/users', {session: req.session, users: users, emails: emails, isAdmin: isAdmin, config: config});
        })
        .catch((err) => {
            console.error(err);
            return res.render('admin/users', {session: req.session, users: "error", emails: "error", isAdmin: isAdmin, config: config});
        });
});

router.get('/timers', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.redirect('/login');
    var isAdmin = await utils.isAdmin(req.session);

    if (!isAdmin) return res.redirect('/');

    await db.get(`timers`)
        .then((data) => {
            return res.render('admin/timers', {session: req.session, timers: data.sort((a, b) => a.created - b.created), isAdmin: isAdmin, config: config});
        })
        .catch((err) => {
            console.error(err);
            return res.render('admin/timers', {session: req.session, timers: "error", isAdmin: isAdmin, config: config});
        });
});

module.exports = router