const { QuickDB } = require("quick.db");
const transporter = require('../index');
const config = require('../config');
const codes = require('./err-codes');
const crypto = require('crypto');
const db = new QuickDB();

async function isLogged(session) {
    if (!session.logged || !session.username || !session.password) return false;
    var username_res = await db.get(`user_${session.username}.username`);
    if (!username_res) return false;
    var password_res = await db.get(`user_${session.username}.password`);
    if (!password_res) return false;

    var verified = await db.get(`user_${session.username}.verified`);
    if (!verified) return false;

    var result = compare(session.password, password_res);
    return result;
}

async function isAdmin(session) {
    if (!session.logged || !session.username || !session.password) return false;
    return await db.get(`user_${session.username}.admin`);
}

async function validateApiKey(user, apiKey) {
    if (!apiKey) return false;

    return await db.get(`api_${user}_${apiKey}`) ? true : false;
}

async function isKeyBanned(user, apiKey) {
    var username = db.get(`api_${user}_${apiKey}.username`);

    return db.get(`user_${username}.banned`);
}

async function sendMail(to, subject, text, html) {
    var mailDetails = {
        from: config.email.username,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    await transporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            console.log('Verification email sent successfully');
        }
    });
}

function makeid(length, type) {
    var result = '';
    var characters;
    if (type == "normal" || type == "default") characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    if (type == "number" || type == "numonly") characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

async function setIfNotExists(what, value) {
    if (!await db.get(what)) {
        await db.set(what, value);
    }
}

function error(error, message) {
    return {
        "errors": [
            {
                "code": codes[error],
                "message": message
            }
        ],
        "success": false
    }
}

function hash(plain) {
    let hash = crypto.createHmac('sha512', "");
    hash.update(plain);
    let value = hash.digest('hex');
    return value;
}

function compare(plain, hashed) {
    var plainhash = hash(plain);
    if (plainhash == hashed) return true;
    return false;
}


module.exports = { isLogged, isAdmin, validateApiKey, isKeyBanned, makeid, error, setIfNotExists, hash, compare }