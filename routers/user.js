const utils = require('../utils/helpers.js');
const express = require('express');
const router = express.Router();
const session = require('express-session');
const { QuickDB } = require("quick.db");
var db = new QuickDB();
var config = require('../config');

router.use(session({
    secret: 'keyboard cat XDDDDDDDD soundenginebestratjebiecimatkeelo',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

router.get('/:user', async (req, res) => {
    var isAdmin = await utils.isAdmin(req.session);

    var user = req.params.user;

    if (user == req.session.username) return res.redirect('/user');
    if (!await db.get(`user_${user}`)) return res.redirect('/user');

    await db.get(`timers`)
    .then((data) => {
        var timers = data.filter(t => t.username == user && t.private == false).sort((a, b) => a.created - b.created);

        return res.render('user', {session: req.session, username: user, timers: timers, isAdmin: isAdmin, config: config});
    })
    .catch((err) => {
        console.error(err);
        return res.render('user', {session: req.session, username: user, timers: "error", isAdmin: isAdmin, config: config});
    });
});

router.post('/delete', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(400).json(utils.error("INVALID_SESSION", "You are not logged in."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to delete users."));

    if (!req.body.user) return res.status(400).json(utils.error("INVALID_BODY", "Body is not valid."));
    if (req.body.user == req.session.username) return res.status(400).json(utils.error("INVALID_BODY", "You can't delete your account"));
    if (req.body.user == config.admin.username) return res.status(400).json(utils.error("INSUFFICIENT_PERMISSIONS", "You can't delete admin account"));

    if (!await db.get(`user_${req.body.user}`)) return res.status(400).json(utils.error("INVALID_BODY", "This user does not exist."));
    if (await db.get(`user_${req.body.user}.admin`) && req.body.user != config.admin.username) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to delete admins"));

    var email = await db.get(`user_${req.body.user}.email`);

    await db.delete(`email_${email}`);
    await db.delete(`user_${req.body.user}`);

    return res.status(200).json({
        "errors": [],
        "message": "User deleted",
        "success": true
    })
})

router.post('/promote', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(400).json(utils.error("INVALID_SESSION", "You are not logged in."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to promoteo users."));

    if (!req.body.user) return res.status(400).json(utils.error("INVALID_BODY", "Body is not valid."));
    if (req.body.user == req.session.username) return res.status(400).json(utils.error("INVALID_BODY", "You can't promote yourself"));
    if (req.body.user == config.admin.username) return res.status(400).json(utils.error("INSUFFICIENT_PERMISSIONS", "You can't promote admin account"));

    if (!await db.get(`user_${req.body.user}`)) return res.status(400).json(utils.error("INVALID_BODY", "This user does not exist."));
    if (await db.get(`user_${req.body.user}.admin`) && req.body.user != config.admin.username) return res.status(400).json(utils.error("INSUFFICIENT_PERMISSIONS", "You can't promote admin account"));

    await db.set(`user_${req.body.user}.admin`, true);

    return res.status(200).json({
        "errors": [],
        "message": "User promoted",
        "success": true
    })
})

router.post('/degrade', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(400).json(utils.error("INVALID_SESSION", "You are not logged in."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to degrade users."));

    if (!req.body.user) return res.status(400).json(utils.error("INVALID_BODY", "Body is not valid."));
    if (req.body.user == req.session.username) return res.status(400).json(utils.error("INVALID_BODY", "You can't degrade yourself"));
    if (req.body.user == config.admin.username) return res.status(400).json(utils.error("INSUFFICIENT_PERMISSIONS", "You can't degrade admin account"));

    if (!await db.get(`user_${req.body.user}`)) return res.status(400).json(utils.error("INVALID_BODY", "This user does not exist."));
    if (await db.get(`user_${req.body.user}.admin`) && req.session.username != config.admin.username) return res.status(400).json(utils.error("INSUFFICIENT_PERMISSIONS", "You can't degrade admin account"));

    await db.set(`user_${req.body.user}.admin`, false);

    return res.status(200).json({
        "errors": [],
        "message": "User degraded",
        "success": true
    })
})

router.post('/ban', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(400).json(utils.error("INVALID_SESSION", "You are not logged in."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to ban users."));

    if (!req.body.user) return res.status(400).json(utils.error("INVALID_BODY", "Body is not valid."));
    if (req.body.user == req.session.username) return res.status(400).json(utils.error("INVALID_BODY", "You can't ban yourself."));
    if (req.body.user == config.admin.username) return res.status(400).json(utils.error("INSUFFICIENT_PERMISSIONS", "You can't ban master account."));

    if (!await db.get(`user_${req.body.user}`)) return res.status(400).json(utils.error("INVALID_BODY", "This user does not exist."));
    if (await db.get(`user_${req.body.user}.admin`) && req.body.user != config.admin.username) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to ban admins"));

    await db.set(`user_${req.body.user}.banned`, true);

    return res.status(200).json({
        "errors": [],
        "message": "User banned",
        "success": true
    })
})

router.post('/unban', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(400).json(utils.error("INVALID_SESSION", "You are not logged in."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to unban users."));

    if (!req.body.user) return res.status(400).json(utils.error("INVALID_BODY", "Body is not valid."));
    if (req.body.user == req.session.username) return res.status(400).json(utils.error("INVALID_BODY", "You can't unban yourself."));
    if (req.body.user == config.admin.username) return res.status(400).json(utils.error("INSUFFICIENT_PERMISSIONS", "You can't unban master account."));

    if (!await db.get(`user_${req.body.user}`)) return res.status(400).json(utils.error("INVALID_BODY", "This user does not exist."));
    if (!await db.get(`user_${req.body.user}.banned`)) return res.status(400).json(utils.error("INVALID_BODY", "This user is not banned."));
    if (await db.get(`user_${req.body.user}.admin`) && req.body.user != config.admin.username) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to unban admins"));

    await db.set(`user_${req.body.user}.banned`, false);

    return res.status(200).json({
        "errors": [],
        "message": "User unbanned",
        "success": true
    })
})

router.post('/email/delete', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(400).json(utils.error("INVALID_SESSION", "You are not logged in."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to delete emails."));

    if (!req.body.email) return res.status(400).json(utils.error("INVALID_BODY", "Body is not valid."));
    if (await db.get(`email_${req.body.email}.username`) == req.session.username) return res.status(400).json(utils.error("INVALID_BODY", "You can't delete your account"));
    if (req.body.email == config.admin.email) return res.status(400).json(utils.error("INSUFFICIENT_PERMISSIONS", "You can't delete master account"));

    if (!await db.get(`email_${req.body.email}`)) return res.status(400).json(utils.error("INVALID_BODY", "This user does not exist."));

    var username = await db.get(`email_${req.body.email}.username`);

    await db.delete(`user_${username}`);
    await db.delete(`email_${req.body.email}`);

    return res.status(200).json({
        "errors": [],
        "message": "Email deleted",
        "success": true
    })
})

module.exports = router;