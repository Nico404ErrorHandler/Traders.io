const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./ArticleDB.db");

class ArticleDB {
    constructor() {
        this.init();
    }


    // Die Datenbank wird erstellt
    init() {
        db.run(`
            CREATE TABLE IF NOT EXISTS
                articles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    provider TEXT,
                    lentTo TEXT,
                    loanable TEXT,
                    borrowtime TEXT,
                    borrowedon TEXT,
                    borrowedtil TEXT,
                    description TEXT,
                    image TEXT,
                    providerimage TEXT
                )`);
    }

    // Ein neuer Artikel wird der Datenbank hinzugefügt und eine Fortlaufende ID wird automatisch generiert
    async saveArticle(article) {
        return new Promise(function (resolve, reject) {
            db.run(`
                INSERT INTO articles (
                    name,     
                    provider,
                    lentTo,
                    loanable,
                    borrowtime,
                    borrowedon,
                    borrowedtil,
                    description,
                    image,
                    providerimage)
                    VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [article.name, article.provider, article.lentTo, article.loanable, article.borrowtime, article.borrowedon, article.borrowedtil, article.description, article.image, article.providerimage],
                function () {
                    resolve(this.lastID);
                }
            );
        });
    }

    // liefert den ganzen Artikel bei angabe seiner ID
    async getArticleId(id) {
        return new Promise(function (resolve, reject) {
            db.get(`
                SELECT * FROM articles WHERE id = ?`,
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

    //liefert alle verfügbaren Artikel eines bestimmten Anbieters
    async getAvailableArticles(provider) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM articles WHERE loanable = true AND provider = ?`, [provider], (error, row) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // liefert alle Artikel eines Anbieters
    async getArticles(provider) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM articles WHERE provider = ?`,
                [provider],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    // liefert alle von einer bestimmten Person ausgeliehenen Artikel
    async getLentArticles(lentTo) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM articles WHERE lentTo = ?`,
                [lentTo],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    //ermöglicht es den Namen, die Beschreibung und das Bild eines Artikels zu verändern
    async updateArticle(article) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE articles SET name = ?, description = ?, image = ?
            WHERE id = ?`,
                [article.name, article.description, article.image, article.id],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    //verändert die Verfügbarkeit des Artikels auf ausgeliehen, hinterlegt den Namen des Ausleihenden und den Zeitbereich des Ausleihens
    async borrowArticle(id, lentTo, date, date2) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE articles SET loanable = false, lentTo = ?, borrowedon = ?, borrowedtil = ? 
            WHERE id = ?`,
                [lentTo, date, date2, id],
                (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    // bei Rückgabe eines Artikels unter der Verwendung der Id wird der Artikel wieder als verfügbar markiert und alle Ausleiherspeziefischen Daten werden zurückgesetzt
    async returnArticle(id) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE articles SET loanable = true, lentTo = "", borrowedon = "", borrowedtil = ""
            WHERE id = ?`,
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

    // unter Verwendung der ID kann ein Artikel aus der Datenbank gelöscht werden
    async deleteArticle(id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM articles 
            WHERE id = ?`,
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
}

module.exports = ArticleDB;