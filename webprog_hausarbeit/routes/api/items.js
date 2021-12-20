"use strict"
//Import der Bibliotheken
const express = require("express");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const ArticleDB = require("../../static/collections/articleCollection");
const UserDB = require("../../static/collections/userCollection");

//Router und Datenbank deklarieren
let router = express.Router();
const articleDB = new ArticleDB();
const userDB = new UserDB();

//Hier werden die Update-Anfragen eines einzelnen Artikels bearbeitet
router.get("/items/edit/:id", async (request, response) => {
    let id = request.params.id;
    let article = await articleDB.getArticleId(id);
    let message = {
        text: `
        <div class="Main">
            <form class="form" onsubmit="editArticle(event,this)" enctype="multipart/form-data">
            <input class="hidden" type="text" id="id" name="id" value="${article.id}">
            <label >Name: </label>
            <input id="nametext" type="text" id="name" name="name" value="${article.name}">
            <label >Beschreibung: </label>
            <textarea class="form" id="description" name="description" cols="20" rows="8"">${article.description}</textarea>
            <label >Bild:</label>
            <input  type="file"id="image" name="image" value="">
            <img src="${article.image}" height="200px" width="400px">
            <input  type="submit" value="Bearbeiten">
            <input  type="button" onclick="javascript:reload()" value="Abbrechen">
            </form>
        </div>`
    };
    response.end(JSON.stringify(message));
});

//Hier werden Informationen des Items, mit der einer bestimmten ID ausgegeben.
router.get("/items/:id", async (request, response) => {
    let id = request.params.id;
    let article = await articleDB.getArticleId(id);
    //Neuen Datensatz von Article generieren ohne den Base64-Imagestring
    let data = {
        id: article.id,
        name: article.name,
        provider: article.provider,
        providerimage: article.providerimage,
        image: article.image,
        lentTo: article.lentTo,
        loanable: article.loanable,
        borrowtime: article.borrowtime,
        borrowedon: article.borrowedon,
        borrowedtil: article.borrowedtil,
        description: article.description
    }
    response.end(JSON.stringify(data));
});

//Fügt einen Gegenstand der Datenbank hinzu
router.post("/items/:username", async (request, response) => {
    const form = formidable({ multiples: true });
    let providerimage = await userDB.getUserImage(request.params.username);
    form.parse(request, (err, body, picture) => {

        //Für Api-Anfragen via Command Line
        if (body.cli === 'true') {
            let articledata = {
                name: body.name,
                provider: body.provider,
                lentTo: body.lentTo,
                loanable: body.loanable,
                borrowtime: body.borrowtime,
                description: body.description,
                image: body.image,
                providerimage: body.providerimage
            }
            articleDB.saveArticle(articledata);
            response.json({ status: true, text: "article posted" });

            //Für normale Webanfragen via Browser
        } else {
            let bodyParamsEmpty = body.name === "" || body.description === "";
            if (bodyParamsEmpty) {
                response.json({ status: false, text: "Namen oder Beschreibung hinzufügen!" });
            } else {
                if (picture.image.originalFilename === "") {
                    var oldPath = path.join(__dirname, "../", "../", "static", "images", "default.png");
                    var newPath = path.join(__dirname, "../", "../", "static", "images", "default.png");
                } else {
                    var oldPath = picture.image.filepath;
                    var newPath = path.join(__dirname, "../", "../", "static", "images", picture.image.originalFilename);
                }
                fs.rename(oldPath, newPath, () => {
                    let ext = path.extname(newPath);
                    const image = fs.readFileSync(newPath);
                    let base64 = Buffer.from(image, "binary").toString("base64");
                    let imageBase64 = `data:image/${ext.split(".").pop()};base64,${base64}`;
                    let articledata = {
                        name: body.name,
                        provider: request.params.username,
                        loanable: true,
                        lentTo: "",
                        borrowtime: body.borrowtime,
                        description: body.description,
                        image: imageBase64,
                        providerimage: providerimage
                    }
                    articleDB.saveArticle(articledata);
                    response.json({ status: true, text: "article posted" });
                });
            }
        }
    });
});

//Hier werden die Update-Anfragen eines einzelnen Artikels bearbeitet
router.put("/items/:id", async (request, response) => {
    const form = formidable({ multiples: true });
    let id = request.params.id;

    form.parse(request, (err, body, picture) => {
        //Für Api-Anfragen via Command Line
        if (body.cli === "true") {
            const articleData = {
                name: body.name,
                description: body.description,
                image: body.image,
                id: id
            }
            articleDB.updateArticle(articleData);
            //Für normale Webanfragen via Browser
        } else {

            if (picture.image.originalFilename == "") {
                var oldPath = path.join(__dirname, "../", "../", "static", "images", "default.png");
                var newPath = path.join(__dirname, "../", "../", "static", "images", "default.png");

            } else {
                var oldPath = picture.image.filepath;
                var newPath = path.join(__dirname, "../", "../", "static", "images", picture.image.originalFilename);
            }

            fs.rename(oldPath, newPath, () => {
                let ext = path.extname(newPath);
                const image = fs.readFileSync(newPath);
                let base64 = Buffer.from(image, "binary").toString("base64");
                let imageBase64 = `data:image/${ext.split(".").pop()};base64,${base64}`;
                let articledata = {
                    name: body.name,
                    description: body.description,
                    image: imageBase64,
                    id: id
                }
                articleDB.updateArticle(articledata);
            });
        }
    });
    response.json({ status: true, text: "article posted" });
});

//Hier werden die Lösch-Anfragen der Artikel bearbeitet
router.delete("/items/:id", async (request, response) => {
    let id = request.params.id;
    articleDB.deleteArticle(id);
    response.json({ status: true, text: "article deleted" });
});

//Hier wird der Borrow-Endpunkt behandelt und setzt loanable auf false
router.post("/borrow/:id/:username", async (request, response) => {
    let id = request.params.id;
    let username = request.params.username;
    let time = await articleDB.getArticleId(id);
    let message = request.body.message;

    let date = new Date();
    let d = date.getTime();
    let calc = d + (time.borrowtime * 24 * 60 * 60 * 1000);

    articleDB.borrowArticle(id, username, d, calc);
    response.json({ status: true, text: "article borrowed" });
});

//Hier wird der Return-Endpunkt behandelt und setzt loanable auf true
router.post("/return/:id", async (request, response) => {
    let id = request.params.id;
    articleDB.returnArticle(id);
    response.json({ status: true, text: "article returned" });
});

module.exports = router;