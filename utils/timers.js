const { QuickDB } = require("quick.db");
const db = new QuickDB();

const utils = require('./helpers.js');

async function createTimer(data) {
    var timerId = utils.makeid(12, "default");

    await db.push(`timers`, {
        id: timerId,
        title: data.title,
        date: data.date,
        time: data.time,
        display: data.display,
        username: data.username,
        private: data.private,
        featured: data.featured,
        created: Date.now()
    });

    return timerId;
}

async function deleteTimer(id) {
    await db.get(`timers`)
        .then(async (data) => {
            await db.pull(`timers`, t => t.id == id);
        })
        .catch((err) => {
            console.error(err);
        }
    );
}

async function featureTimer(id) {
    await db.get(`timers`)
        .then(async (data) => {
            var timer = data.find(t => t.id == id);

            await db.pull(`timers`, t => t.id == id);

            var newTimer = {
                id: timer.id,
                title: timer.title,
                date: timer.date,
                time: timer.time,
                display: timer.display,
                username: timer.username,
                private: timer.private,
                featured: true,
                created: timer.created
            }

            await db.push(`timers`, newTimer);
        })
        .catch((err) => {
            console.error(err);
        }
    );
}

async function unfeatureTimer(id) {
    await db.get(`timers`)
        .then(async (data) => {
            var timer = data.find(t => t.id == id);

            await db.pull(`timers`, t => t.id == id);

            var newTimer = {
                id: timer.id,
                title: timer.title,
                date: timer.date,
                time: timer.time,
                display: timer.display,
                username: timer.username,
                private: timer.private,
                featured: false,
                created: timer.created
            }

            await db.push(`timers`, newTimer);
        })
        .catch((err) => {
            console.error(err);
        }
    );
}

async function publicTimer(id) {
    await db.get(`timers`)
        .then(async (data) => {
            var timer = data.find(t => t.id == id);

            await db.pull(`timers`, t => t.id == id);

            var newTimer = {
                id: timer.id,
                title: timer.title,
                date: timer.date,
                time: timer.time,
                display: timer.display,
                username: timer.username,
                private: false,
                featured: timer.featured,
                created: timer.created
            }

            await db.push(`timers`, newTimer);
        })
        .catch((err) => {
            console.error(err);
        }
    );
}

async function privateTimer(id) {
    await db.get(`timers`)
        .then(async (data) => {
            var timer = data.find(t => t.id == id);

            await db.pull(`timers`, t => t.id == id);

            var newTimer = {
                id: timer.id,
                title: timer.title,
                date: timer.date,
                time: timer.time,
                display: timer.display,
                username: timer.username,
                private: true,
                featured: timer.featured,
                created: timer.created
            }

            await db.push(`timers`, newTimer);
        })
        .catch((err) => {
            console.error(err);
        }
    );
}

module.exports = { createTimer, deleteTimer, featureTimer, unfeatureTimer, publicTimer, privateTimer }