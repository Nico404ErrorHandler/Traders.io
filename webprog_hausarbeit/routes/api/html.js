"ust strict"
const express = require("express");
let router = express.Router();
const path = require("path");
const ArticleDB = require("../../static/collections/articleCollection");
const articleDB = new ArticleDB();
const CommunityDB = require("../../static/collections/communityCollection")
const communityDB = new CommunityDB();

//Hier werden die Ausleihen-Anfragen bearbeitet und sendet
//alle registrierten Artikel von der Datenbank zum Client
router.post("/ausleihen/:username", async (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    let users = await communityDB.getAllFriends(request.params.username);
    let data = [];
    for (let user of users) {
        data[data.length] = new Object(await articleDB.getAvailableArticles(user.user));
    }
    response.end(JSON.stringify(data));
});

//Hier wird die Verleihen-Anfrage bearbeitet und sendet dem
//zugesendeten Namen alle dazugehörigen Artikel
router.get("/verleihen/:provider", async (request, response) => {
    let provider = request.user;
    let articles = await articleDB.getArticles(provider);
    response.end(JSON.stringify(articles));
});

//Hier wird die Ausgeliehen-Anfrage der Ausgeliehen-Seite bearbeitet
//und sendet dem zugesendeten Namen alle dazugehörigen Artikel
router.get("/ausgeliehen/:lentTo", async (request, response) => {
    let user = request.user;
    let articles = await articleDB.getLentArticles(user);
    response.end(JSON.stringify(articles));
});

//Im folgenden werden die statischen HTML-Dokumente ausgeliefert via Routes
router.get("/ausleihen", (request, response) => {
    let html = path.join(__dirname, "../../static/html/ausleihen.html");
    response.sendFile(html);
});

router.get("/verleihen", (request, response) => {
    let html = path.join(__dirname, "../../static/html/verleihen.html");
    response.sendFile(html);
});

router.get("/verleihenAdd", (request, response) => {
    let html = path.join(__dirname, "../../static/html/verleihenAdd.html");
    response.sendFile(html);
});

router.get("/ausgeliehen", (request, response) => {
    let html = path.join(__dirname, "../../static/html/ausgeliehen.html");
    response.sendFile(html);
});

router.get("/edituserprofile", (request, response) => {
    let html = path.join(__dirname, "../../static/html/edituserprofile.html");
    response.sendFile(html);
});

router.get("/community", (request, response) => {
    let html = path.join(__dirname, "../../static/html/community.html");
    response.sendFile(html);
});

router.get("/login", (request, response) => {
    let html = path.join(__dirname, "../../static/html/login.html");
    response.sendFile(html);
});

router.get("/register", (request, response) => {
    let html = path.join(__dirname, "../../static/html/register.html");
    response.sendFile(html);
});

module.exports = router;