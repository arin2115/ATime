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

router.get('/:type', async (req, res) => {
    return res.status(405).json(utils.error("METHOD_NOT_ALLOWED", "Method is not allowed."));
})

router.post('/:type', async (req, res) => {
    // ApiKey Check
    var type = req.params.type;
    if (!req.headers["authorization"] || !req.headers["authorization"].split(" ")[0] || !req.headers["authorization"].split(" ")[1] || !req.headers["authorization"].split(" ")[2]) return res.status(400).json(utils.error("MISSING_APIKEY", "Authorization header not found."));
    var user = req.headers["authorization"].split(" ")[1];
    var token = req.headers["authorization"].split(" ")[2];
    if (!utils.validateApiKey(user, token)) return res.status(400).json(utils.error("INVALID_APIKEY", "ApiKey is not valid."));
    if (utils.isKeyBanned(user, token)) return res.status(400).json(utils.error("BANNED_APIKEY", "ApiKey is banned."));

    // Types
    if (type == "generateKey") {
        if (!req.headers["user"]) return res.status(400).json(utils.error("MISSING_USER", "User header not found."));
        if (!utils.isLogged(req.session)) return res.status(400).json(utils.error("INVALID_SESSION", "Session is not valid."));
        if (!utils.isAdmin(req.session)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to generate ApiKey."));

        var keys1 = utils.makeid(8, "default");
        var keys2 = utils.makeid(3, "default");
        var keys3 = utils.makeid(5, "default");
        var keys4 = utils.makeid(5, "default");
        var keys5 = utils.makeid(8, "default");
        var key = keys1 + "-" + keys2 + "-" + keys3 + "-" + keys4 + "-" + keys5;
        
        db.set(`api_${req.headers["user"]}_${key}`, {username: req.headers["user"]});

        return res.status(200).json({
            "errors": [],
            "message": key,
            "success": true
        })
    }

    if (type == "getTimer") {
        db.get(`timers`)
            .then((data) => {
                var timer = data.find(t => t.id == req.params.id);
                if (!timer) return res.redirect('/');
                return res.status(200).json({
                    "errors": [],
                    "message": {
                        "title": timer.title,
                        "time": timer.time,
                        "info": timer.info
                    },
                    "success": true
                })
            })
            .catch((err) => {
                console.error(err);
                return res.redirect('/');
            });
   }

    if (type == "createTimer") {
        if (!req.body.title || !req.body.time) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

        var featured = false;

        if (req.body.featured && !await db.get(`user_${user}.admin`)) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to create this timer."));

        featured = req.body.featured;

        if (req.body.private && req.body.featured) featured = false;

        var data = {
            title: req.body.title,
            time: req.body.time,
            info: req.body.info,
            username: user,
            private: req.body.private ? req.body.private : false,
            featured: featured
        }

        var timerId = timer.createTimer(data);

        return res.status(200).json({
            "errors": [],
            "message": timerId,
            "success": true
        });
    }

    if (type == "deleteTimer") {
        if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

        db.get(`timers`)
            .then(async (data) => {
                var timer = data.find(t => t.id == req.body.id);
                if (!timer) return res.status(400).json(utils.error("INVALID_TIMER", "Timer is not valid."));

                if (!await db.get(`user_${user}.admin`) && timer.username != user) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to delete this timer."));

                timer.deleteTimer(req.body.timerId);

                return res.status(200).json({
                    "errors": [],
                    "message": "Timer deleted.",
                    "success": true
                });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json(utils.error("INTERNAL_ERROR", "Internal error."));
            });
    }

    if (type == "featurueTimer") {
        if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

        db.get(`timers`)
            .then(async (data) => {
                var timer = data.find(t => t.id == req.body.id);
                if (!timer) return res.status(400).json(utils.error("INVALID_TIMER", "Timer is not valid."));

                if (!await db.get(`user_${user}.admin`) && timer.username != user) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to feature this timer."));
            
                timer.featureTimer(req.body.timerId);    

                return res.status(200).json({
                    "errors": [],
                    "message": "featured",
                    "success": true
                })
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json(utils.error("INTERNAL_ERROR", "Internal error."));
            });
    }

    if (type == "unfeaturueTimer") {
        if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

        db.get(`timers`)
            .then(async (data) => {
                var timer = data.find(t => t.id == req.body.id);
                if (!timer) return res.status(400).json(utils.error("INVALID_TIMER", "Timer is not valid."));

                if (!await db.get(`user_${user}.admin`) && timer.username != user) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to unfeature this timer."));
            
                timer.unfeatureTimer(req.body.timerId);    

                return res.status(200).json({
                    "errors": [],
                    "message": "unfeatured",
                    "success": true
                })
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json(utils.error("INTERNAL_ERROR", "Internal error."));
            });
    }

    if (type == "publicTimer") {
        if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

        db.get(`timers`)
            .then(async (data) => {
                var timer = data.find(t => t.id == req.body.id);
                if (!timer) return res.status(400).json(utils.error("INVALID_TIMER", "Timer is not valid."));

                if (!await db.get(`user_${user}.admin`) && timer.username != user) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to make this timer public."));
            
                timer.publicTimer(req.body.timerId);    

                return res.status(200).json({
                    "errors": [],
                    "message": "public",
                    "success": true
                })
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json(utils.error("INTERNAL_ERROR", "Internal error."));
            });
    }

    if (type == "privateTimer") {
        if (!req.body.timerId) return res.status(400).json(utils.error("MISSING_DATA", "Missing timer data."));

        db.get(`timers`)
            .then(async (data) => {
                var timer = data.find(t => t.id == req.body.id);
                if (!timer) return res.status(400).json(utils.error("INVALID_TIMER", "Timer is not valid."));

                if (!await db.get(`user_${user}.admin`) && timer.username != user) return res.status(401).json(utils.error("INSUFFICIENT_PERMISSIONS", "You do not have permission to make this timer private."));
            
                timer.privateTimer(req.body.timerId);    

                return res.status(200).json({
                    "errors": [],
                    "message": "private",
                    "success": true
                })
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json(utils.error("INTERNAL_ERROR", "Internal error."));
            });
    }

    return res.status(400).json(utils.error("INVALID_TYPE", "Type is not valid."));
})

module.exports = router