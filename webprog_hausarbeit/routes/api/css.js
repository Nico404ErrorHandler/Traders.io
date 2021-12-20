"ust strict"

const express = require("express");
let router = express.Router();
const path = require("path");

// Alle Routes für die StyleSheets der einzelnen Webpages
router.get("/verleihenAddStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/verleihenAddStyle.css");
    response.sendFile(css);
});

router.get("/indexStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/indexStyle.css");
    response.sendFile(css);
});

router.get("/style", (request, response) => {
    let css = path.join(__dirname, "../../static/css/style.css");
    response.sendFile(css);
});

router.get("/loginStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/loginStyle.css");
    response.sendFile(css);
});

router.get("/registerStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/registerStyle.css");
    response.sendFile(css);
});

router.get("/redirectStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/redirectStyle.css");
    response.sendFile(css);
});

router.get("/rootStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/rootStyle.css");
    response.sendFile(css);
});

router.get("/ausleihStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/ausleihStyle.css");
    response.sendFile(css);
});

router.get("/communityStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/communityStyle.css");
    response.sendFile(css);
});

router.get("/ausgeliehenStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/ausgeliehenStyle.css");
    response.sendFile(css);
});

router.get("/verleihenStyle", (request, response) => {
    let css = path.join(__dirname, "../../static/css/verleihenStyle.css");
    response.sendFile(css);
});


module.exports = router;