const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./UserDB.db");

class UserDB {
    constructor() {
        this.init();
    }

    //Anlegen einer User-Tabelle
    init() {
        db.run(`
            CREATE TABLE IF NOT EXISTS
                users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT,
                    firstname TEXT,
                    lastname TEXT,
                    age TEXT,
                    email TEXT,
                    mobilenumber TEXT,
                    city TEXT,
                    password TEXT,
                    image TEXT,
                    sessionid TEXT
                )`);
    }

    //Speichern eines Users
    async saveUser(user) {
        return new Promise(function (resolve, reject) {
            db.run(`
                INSERT INTO users (
                    username,
                    firstname,
                    lastname,
                    age,
                    email,
                    mobilenumber,
                    city,
                    password,
                    image,
                    sessionid)
                    VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [user.username, user.firstname, user.lastname, user.age,
                user.email, user.mobilenumber, user.city, user.password, user.image, user.sessionid],
                function () {
                    resolve(this.lastID);
                }
            );
        });
    }

    // Existiert ein User mit dem einem bestimmten Username
    async getUsername(username) {
        return new Promise(function (resolve, reject) {
            db.get(`
                SELECT * FROM users WHERE username = ?`,
                [username], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row != null && row != undefined) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    }

    // Gibt einen bestimmten User zurück
    async getUser(username) {
        return new Promise(function (resolve, reject) {
            db.get(`
                SELECT * FROM users WHERE username = ?`,
                [username], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row != null && row != undefined) {
                        resolve(row);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    }

    //Prüfen ob ein User mit der mitgegebenen SessionID existiert, und Username zurückgeben
    async getUserSession(sessionid) {
        return new Promise(function (resolve, reject) {
            db.get(`
                SELECT * FROM users WHERE sessionid = ?`,
                [sessionid], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row != null && row != undefined) {
                        resolve(row.username);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    }

    //Prüfen ob ein User mit dem mitgegebenen Username existiert, und SessionID zurückgeben
    async getSessionID(username) {
        return new Promise(function (resolve, reject) {
            db.get(`
                SELECT * FROM users WHERE username = ?`,
                [username], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row != null && row != undefined) {
                        resolve(row.sessionid);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    }

    //Updaten der SessionID bei erneutem Anmelden
    async updateUserSession(username, sessionid) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE users SET sessionid = ? WHERE username = ?`,
                [sessionid, username],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    //Zurückgeben eines Users mit einer spezifischen ID
    async getUserId(id) {
        return new Promise(function (resolve, reject) {
            db.get(`
                SELECT * FROM users WHERE id = ?`,
                [id], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row != null && row != undefined) {
                        resolve(row);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    }

    //Zurückgeben eines Users mit passendem Username
    async getUserName(username) {
        return new Promise(function (resolve, reject) {
            db.get(`
                SELECT * FROM users WHERE username = ?`,
                [username], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row != null && row != undefined) {
                        resolve(row);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    }

    //Zurückgeben des gehashten Passwortes
    async getHash(username) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.password);
                }
            })
        })
    }

    //Zurückgeben des Profilbildes eines spezifischen Users
    async getUserImage(username) {
        return new Promise(function (resolve, reject) {
            db.get(`
                SELECT * FROM users WHERE username = ?`,
                [username], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row != null && row != undefined) {
                        resolve(row.image);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    }

    //Anpassen und aktualisieren eines User-Eintrages
    async updateUser(user) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE users SET firstname = ?, lastname = ?, age = ?, email = ?, mobilenumber = ?,
            city = ?, image = ? 
            WHERE id = ?`,
                [user.firstname, user.lastname, user.age, user.email, user.mobilenumber, user.city, user.image, user.id],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    //Zurückgeben aller registrierten User
    async getAllUser(username) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM users WHERE username != ?`, [username], (error, row) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            });
        });
    }

    //Existiert ein User-Eintrag mit der spezifischen SessionID
    async existsSessionID(sessionID) {
        return new Promise(function (resolve, reject) {
            db.get(
                `SELECT * FROM users WHERE sessionid = ?`,
                [sessionID], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row != null && row != undefined) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    }
}

module.exports = UserDB;