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
        stopped: data.stopped || false,
        stopDays: data.stopDays || 0,
        stopHours: data.stopHours || 0,
        stopMinutes: data.stopMinutes || 0,
        stopSeconds: data.stopSeconds || 0,
        created: Date.now()
    });

    return timerId;
}

async function editTimer(timerData) {
    if (!timerData.id || !timerData.title || !timerData.date || !timerData.time || !timerData.display) return console.error("Missing timer data.");

    await db.get(`timers`)
        .then(async (data) => {
            var timer = data.find(t => t.id == timerData.id);

            await db.pull(`timers`, t => t.id == timerData.id);

            var newTimer = {
                id: timerData.id,
                title: timerData.title,
                date: timerData.date,
                time: timerData.time,
                display: timerData.display,
                username: timer.username,
                private: timer.private,
                featured: timer.featured,
                stopped: timer.stopped || false,
                stopDays: timer.stopDays || 0,
                stopHours: timer.stopHours || 0,
                stopMinutes: timer.stopMinutes || 0,
                stopSeconds: timer.stopSeconds || 0,
                created: timer.created
            }

            await db.push(`timers`, newTimer);
        })
        .catch((err) => {
            console.error(err);
        }
    );
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
                stopped: timer.stopped || false,
                stopDays: timer.stopDays || 0,
                stopHours: timer.stopHours || 0,
                stopMinutes: timer.stopMinutes || 0,
                stopSeconds: timer.stopSeconds || 0,
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
                stopped: timer.stopped || false,
                stopDays: timer.stopDays || 0,
                stopHours: timer.stopHours || 0,
                stopMinutes: timer.stopMinutes || 0,
                stopSeconds: timer.stopSeconds || 0,
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
                stopped: timer.stopped || false,
                stopDays: timer.stopDays || 0,
                stopHours: timer.stopHours || 0,
                stopMinutes: timer.stopMinutes || 0,
                stopSeconds: timer.stopSeconds || 0,
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
                stopped: timer.stopped || false,
                stopDays: timer.stopDays || 0,
                stopHours: timer.stopHours || 0,
                stopMinutes: timer.stopMinutes || 0,
                stopSeconds: timer.stopSeconds || 0,
                created: timer.created
            }

            await db.push(`timers`, newTimer);
        })
        .catch((err) => {
            console.error(err);
        }
    );
}

async function stopTimer(id) {
    await db.get(`timers`)
        .then(async (data) => {
            var timer = data.find(t => t.id == id);

            await db.pull(`timers`, t => t.id == id);
            
            var targetDate = new Date(timer.date + "T" + timer.time);
            var currentDate = new Date();

            var diff = (currentDate - targetDate)/1000;
            var diff = Math.abs(Math.floor(diff));  

            days = Math.floor(diff/(24*60*60));
            sec = diff - days * 24*60*60;
            hrs = Math.floor(sec/(60*60));
            sec = sec - hrs * 60*60;
            min = Math.floor(sec/(60));
            sec = sec - min * 60;

            var newTimer = {
                id: timer.id,
                title: timer.title,
                date: timer.date,
                time: timer.time,
                display: timer.display,
                username: timer.username,
                private: timer.private,
                featured: timer.featured,
                stopped: true,
                stopDays: days,
                stopHours: hrs,
                stopMinutes: min,
                stopSeconds: sec,
                created: timer.created
            }

            await db.push(`timers`, newTimer);
        })
        .catch((err) => {
            console.error(err);
        }
    );
}

async function fixTimers() {
    await db.get(`timers`)
        .then((data) => {
            data.forEach(async timer => {
                await db.pull(`timers`, t => t.id == timer.id);
                
                console.log(timer);

                var newTimer = {
                    id: timer.id,
                    title: timer.title || "Unknown",
                    date: timer.date || "0000-00-00",
                    time: timer.time || "00:00",
                    display: timer.display || "{nazwa} od {data} {godzina}",
                    username: timer.username || "Unknown",
                    private: timer.private || false,
                    featured: timer.featured || false,
                    stopped: timer.stopped || false,
                    stopDays: timer.stopDays || 0,
                    stopHours: timer.stopHours || 0,
                    stopMinutes: timer.stopMinutes || 0,
                    stopSeconds: timer.stopSeconds || 0,
                    created: timer.created || Date.now()
                }

                console.log(newTimer);

                await db.push(`timers`, newTimer);
            })
        })
        .catch((err) => {
            console.error(err);
        }
    );
}

module.exports = { createTimer, stopTimer, fixTimers, editTimer, deleteTimer, featureTimer, unfeatureTimer, publicTimer, privateTimer }