var errors = [
    "SUCCESS",
    "INVALID_TYPE",
    "INTERNAL_ERROR",

    "DATABASE_ERROR",
    "MISSING_AUTH",
    "INVALID_AUTH",
    "INVALID_BODY",
    "EMAIL_USED",
    "NICK_USED",
    "AWAITING_VERIFICATION",

    "METHOD_NOT_ALLOWED",
    "MISSING_APIKEY",
    "MISSING_USER",
    "INVALID_APIKEY",

    "INVALID_SESSION",
    "INSUFFICIENT_PERMISSIONS",

    "INVALID_TIMER",
    "MISSING_DATA",
];

function i(of) {
    return errors.indexOf(of);
}

module.exports = {

    SUCCESS: i("SUCCESS"),
    INVALID_TYPE: i("INVALID_TYPE"),
    INTERNAL_ERROR: i("INTERNAL_ERROR"),

    // AUTH
    DATABASE_ERROR: i("DATABASE_ERROR"),
    MISSING_AUTH: i("MISSING_AUTH"),
    INVALID_AUTH: i("INVALID_AUTH"),
    INVALID_BODY: i("INVALID_BODY"),
    EMAIL_USED: i("EMAIL_USED"),
    NICK_USED: i("NICK_USED"),
    AWAITING_VERIFICATION: i("AWAITING_VERIFICATION"),

    // API
    METHOD_NOT_ALLOWED: i("METHOD_NOT_ALLOWED"),
    MISSING_APIKEY: i("MISSING_APIKEY"),
    MISSING_USER: i("MISSING_USER"),
    INVALID_APIKEY: i("INVALID_APIKEY"),

    // SESSION
    INVALID_SESSION: i("INVALID_SESSION"),
    INSUFFICIENT_PERMISSIONS: i("INSUFFICIENT_PERMISSIONS"),

    // TIMERS
    INVALID_TIMER: i("INVALID_TIMER"),
    MISSING_DATA: i("MISSING_DATA"),

}