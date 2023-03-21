const { QuickDB } = require("quick.db");
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const utils = require('../utils/helpers.js');

const router = express.Router();
var db = new QuickDB();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session({
    secret: 'keyboard cat XDDDDDDDD soundenginebestratjebiecimatkeelo',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

router.get('/verify/:id', async (req, res) => {
    await db.all()
        .then(async data => {
            var user = data.filter(u => Wu.value.verificationCode == req.params.id)[0];

            if (!user) return res.redirect('/');
            if (user.value.verified) return res.redirect('/');

            await db.set(`user_${user.value.username}.verified`, true);

            return res.send(`Your account has been verified! Click <a href="/">here</a> to go to home page.`);
        })
        .catch(err => {
            console.error(err);
            return res.redirect('/');
        });
});

router.post('/:type', async (req, res) => {
    var type = req.params.type;

    if (type != "logout" && await utils.isLogged(req.session)) res.redirect('/');

    if (type == "register") {
        if (!req.headers["authorization"] || !req.headers['authorization'].split("Basic ").join("")) return res.status(400).json(utils.error("MISSING_AUTH", "Authorization header not found."));
        if (!req.body.email) return res.status(400).json(utils.error("INVALID_BODY", "Body is not valid."));

        var buff = Buffer.from(req.headers["authorization"].split("Basic ").join(""), 'base64');
        var data = buff.toString('ascii');
        var data_split = data.split(":");
        var username = data_split[0];
        var password = data_split[1];

        if (await db.get(`email_${Buffer.from(req.body.email, 'utf-8').toString('base64')}`)) return res.status(400).json(utils.error("EMAIL_USED", "Email is already used."));
        if (await db.get(`user_${username}`)) return res.status(400).json(utils.error("NICK_USED", "Username is already used."));

        var verificationCode = utils.makeid(16, "normal");

        await sendMail(req.body.email, "ATime verification", ``, `<p><b>Hi ${username}!</b></p><p>Verify your account <a href="https://atime.arindev.tech/auth/verify/${verificationCode}">here</a></p>`);
        
        await db.set(`email_${Buffer.from(req.body.email, 'utf-8').toString('base64')}`, {username: username});
        await db.set(`user_${username}`, {username: username, email: Buffer.from(req.body.email, 'utf-8').toString('base64'), password: utils.hash(password), banned: false, admin: false, verified: false, verificationCode: verificationCode});

        req.session.logged = true;
        req.session.username = username;
        req.session.password = password;

        return res.status(200).json({
            "errors": [], 
            "message": "Logged",
            "success": true
        })
    }

    if (type == "login") {
        if (!req.headers["authorization"] || !req.headers['authorization'].split("Basic ").join("")) return res.status(400).json(utils.error("MISSING_AUTH", "Authorization header not found."));

        var buff = Buffer.from(req.headers["authorization"].split("Basic ").join(""), 'base64');
        var data = buff.toString('ascii');
        var data_split = data.split(":");
        var email = data_split[0];
        if (!await db.get(`email_${Buffer.from(email, 'utf-8').toString('base64')}`)) return res.status(401).json(utils.error("INVALID_AUTH", "This user does not exist."));
        var username = await db.get(`email_${Buffer.from(email, 'utf-8').toString('base64')}.username`);
        var password = data_split[1];
        
        var password_res = await db.get(`user_${username}.password`);
        if (!password_res) return res.status(401).json(utils.error("DATABASE_ERROR", "Something went wrong with the database."));

        var verified = await db.get(`user_${username}.verified`);
        if (!verified) return res.status(401).json(utils.error("AWAITING_VERIFICATION", "Check your email and click the verification link."))

        if (utils.compare(password, password_res)) {
            req.session.logged = true;
            req.session.username = username;
            req.session.password = password;

            return res.status(200).json({
                "errors": [],
                "message": "Logged",
                "success": true
            })
        } else {
            return res.status(401).json(utils.error("INVALID_AUTH", "Wrong password."));
        }
    }

    if (type == "logout") {
        if (!req.headers["authorization"] || !req.headers['authorization'].split("Basic ").join("")) return res.status(400).json(utils.error("MISSING_AUTH", "Authorization header not found."));

        var buff = Buffer.from(req.headers["authorization"].split("Basic ").join(""), 'base64');
        var data = buff.toString('ascii');
        if (!db.get(`user_${data}`)) return res.status(401).json(utils.error("INVALID_AUTH", "This user does not exist."));
        
        if (req.session.logged && req.session.username == data) {
            req.session.logged = false;
            req.session.username = null;
            req.session.password = null;

            return res.status(200).json({
                "errors": [],
                "message": "Logged out",
                "success": true
            })
        } else {
            return res.status(401).json(utils.error("INVALID_AUTH", "Auth is not valid."));
        }
    }

    return res.status(400).json(utils.error("INVALID_TYPE", "Type is not valid."));
    
})

module.exports = router