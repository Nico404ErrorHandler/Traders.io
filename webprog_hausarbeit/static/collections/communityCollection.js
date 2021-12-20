const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./CommunityDB.db");

class CommunityCollection {
    constructor() {

    }

    // Hinzufügen einer Userspezifischen Tabelle 
    async addCommunityTable(username) {
        return new Promise(function (resolve, reject) {
            db.run(`
            CREATE TABLE IF NOT EXISTS
                ${username} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT,
                    userid TEXT,
                    friendrequest TEXT)`
            );
        });
    }

    // Senden einer Freundschaftsanfrage
    async sendFriendRequest(username, userid, friend) {
        return new Promise(function (resolve, reject) {
            db.run(`
                INSERT INTO ${friend} (
                    user,
                    userid,
                    friendrequest)
                    VALUES (?,?,?)`,
                [username, userid, "P"]
            );
        });
    }

    // Senden aller vorhandenen Freundschaftsanfragen
    async getAllFriendRequests(username) {
        return new Promise(function (resolve, reject) {
            db.all(`
                    SELECT * FROM ${username} WHERE friendrequest = ?`,
                ["P"],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                })
        })
    };

    //Prüfen ob ein bestimmter User eine Freundschaftsanfrage gestellt hat
    async checkFriendRequest(username, friend) {
        return new Promise(function (resolve, reject) {
            db.get(`
                        SELECT * FROM ${friend} WHERE user = ?`,
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

    // Gebe alle Freunde des Users zurück
    async getAllFriends(username) {
        return new Promise(function (resolve, reject) {
            db.all(`
                        SELECT * FROM ${username} WHERE friendrequest = ?`,
                ["A"],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                })
        })
    };

    //Löschen einer Freundschaftsanfrage
    async deleteFriendRequest(username, id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM ${username} 
                WHERE userid = ?`,
                [id],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    //Löschen eines Freundes
    async deleteFriend(username, friend) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM ${friend} 
                WHERE user = ?`,
                [username],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    // Akzeptieren einer Freundschaftsanfrage
    async acceptFriendRequest(username, friendid) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE ${username} SET friendrequest = ?  
                WHERE userid = ?`,
                ["A", friendid],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    // Hinzufügen eines Freundes in die Freundesliste
    async addFriend(username, friendusername, friendid) {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO ${friendusername} (
                    user,
                    userid,
                    friendrequest)
                    VALUES (?,?,?)`,
                [username, friendid, "A"]
            )
        });
    }
}

module.exports = CommunityCollection;