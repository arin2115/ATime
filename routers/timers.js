const utils = require('../utils/helpers.js');
const timer = require('../utils/timers.js');
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

router.get('/:id', async (req, res) => {
    var isAdmin = await utils.isAdmin(req.session);
    db.get(`timers`)
        .then((data) => {
            var timer = data.find(t => t.id == req.params.id);
            if (!timer) return res.redirect('/');
            return res.render('timer', {session: req.session, isAdmin: isAdmin, timer: timer, config: config});
        })
        .catch((err) => {
            console.error(err);
            return res.redirect('/');
        });
})

router.get('/preview/:title/:date/:info', async (req, res) => {
    var isAdmin = await utils.isAdmin(req.session);

    var timer = {
        title: req.params.title,
        time: req.params.date,
        info: req.params.info
    }

    return res.render('timer', {session: req.session, timer: timer, isAdmin: isAdmin, config: config});
})

router.post('/create', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(401).json(utils.error("INVALID_SESSION", "You do not have permission to create timers."));
    if (!req.body.title || !req.body.time) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

    var featured = false;

    if (await utils.isAdmin(req.session)) featured = req.body.featured;

    if (req.body.private && req.body.featured) featured = false;

    var data = {
        title: req.body.title,
        time: req.body.time,
        info: req.body.info,
        username: req.session.username,
        private: req.body.private,
        featured: featured
    }

    var timerId = timer.createTimer(data)

    return res.status(200).json({
        "errors": [],
        "message": timerId,
        "success": true
    })
})

router.post('/delete', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to delete timers."));
    if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

    timer.deleteTimer(req.body.timerId);

    return res.status(200).json({
        "errors": [],
        "message": "deleted",
        "success": true
    })
})

router.post('/feature', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(401).json(utils.error("INVALID_SESSION", "You do not have permission to feature timers."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to feature timers."));
    if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

    timer.featureTimer(req.body.timerId);

    return res.status(200).json({
        "errors": [],
        "message": "featured",
        "success": true
    })
})

router.post('/unfeature', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(401).json(utils.error("INVALID_SESSION", "You do not have permission to unfeature timers."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to unfeature timers."));
    if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

    timer.unfeatureTimer(req.body.timerId);

    return res.status(200).json({
        "errors": [],
        "message": "unfeatured",
        "success": true
    })
})

router.post('/public', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(401).json(utils.error("INVALID_SESSION", "You do not have permission to make timers public."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to make timers public."));
    if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

    timer.publicTimer(req.body.timerId);

    return res.status(200).json({
        "errors": [],
        "message": "public",
        "success": true
    })
})

router.post('/private', async (req, res) => {
    if (!await utils.isLogged(req.session)) return res.status(401).json(utils.error("INVALID_SESSION", "You do not have permission to make timers private."));
    if (!await utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to make timers private."));
    if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

    timer.privateTimer(req.body.timerId);

    return res.status(200).json({
        "errors": [],
        "message": "private",
        "success": true
    })
})

module.exports = router