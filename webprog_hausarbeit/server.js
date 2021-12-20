//Imports von Bibliotheken
const express = require("express");
const cookieParser = require("cookie-parser")
const path = require("path");

//Imports von Klassen
const UserDB = require("./static/collections/userCollection");

//Zuweisung der Variablen
const app = express();
const userDB = new UserDB();
const HOST = "localhost";
const PORT = 8000;

//Routes deklarieren
const items = require("./routes/api/items");
const static = require("./routes/api/html");
const users = require("./routes/api/users");
const css = require("./routes/api/css");
const authenticate = require("./routes/api/authenticate");
const { request, response } = require("express");

//Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));
app.use(express.urlencoded({ extended: true }));

//Middlewares Routes
app.use("/api/authenticate", authenticate.router);
app.use("/private/api", cookieChecker, items);
app.use("/private/api/html", cookieChecker, static);
app.use("/private/api/users", cookieChecker, users);
app.use("/api/css", css);

//Statische Index.html ausliefern
app.get("/", (request, response) => {
    let html = path.join(__dirname, "/static/html/index.html");
    response.sendFile(html);
});

//Ausloggen und Cookie wird gelöscht
app.get("/logout", (request, response) => {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html");
    response.setHeader("Set-Cookie", "SessionID=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure");
    response.setHeader("Set-Cookie", "Username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure");
    response.redirect("/api/html/login");
});

//Bereitstellen der HTML-Dokumente welche nicht unter /private erreichbar sein sollen
//Redirect HTML
app.get("/redirect", async (request, response) => {
    let html = path.join(__dirname, "/static/html/redirect.html");
    response.sendFile(html);
})

//Login HTML
app.get("/api/html/login", async (request, response) => {
    let html = path.join(__dirname, "/static/html/login.html");
    response.sendFile(html);
})

//Register HTML
app.get("/api/html/register", async (request, response) => {
    let html = path.join(__dirname, "/static/html/register.html");
    response.sendFile(html);
})

//Überprüfen der gesendeten Cookies
async function cookieChecker(request, response, next) {
    const user = await userDB.getUserSession(request.cookies.SessionID);
    if (await userDB.existsSessionID(request.cookies.SessionID)) {
        request.user = user;
        next();
    } else {
        response.redirect("/redirect");
    }
}

//Server wird gestartet
const server = app.listen(PORT, () => {
    console.log(`REST-Server running on http://${HOST}:${PORT}`);
});


