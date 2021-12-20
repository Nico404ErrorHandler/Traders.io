//Import der Module
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const UserDB = require("../../static/collections/userCollection");

//Router, Datenbank und SessionID deklarieren
let router = express.Router();
const userDB = new UserDB();
var sessionID;

//Deklarieren der CommunityDatenbank
const CommunityDB = require("../../static/collections/communityCollection");
let communityDB = new CommunityDB();

//Überprüfen und speichern eines Nutzers in den Datenbanken bei Registrierung
router.post("/register/:username", async (request, response) => {
    let oldPath, newPath;
    const form = formidable({ multiples: true });
    const username = request.params.username;
    const isTaken = await userDB.getUsername(username);

    form.parse(request, async (err, body, picture) => {
        const pwhash = await bcrypt.hash(body.password, 10);
        const bodyParamsEmpty = body.username == "" || body.firstname == "" || body.lastname == "" || body.age == "" || body.email == "" || body.mobilenumber == "" || body.city == "" || body.password == "";

        if (!isTaken && !bodyParamsEmpty) {

            if (picture.image.originalFilename != "") {
                oldPath = picture.image.filepath;
                newPath = path.join(__dirname, "../", "../", "static", "images", picture.image.originalFilename);
            } else {
                oldPath = path.join(__dirname, "../", "../", "static", "images", "user_default.jfif");
                newPath = path.join(__dirname, "../", "../", "static", "images", "user_default.jfif");
            }

            fs.rename(oldPath, newPath, () => {
                const ext = path.extname(newPath);
                const image = fs.readFileSync(newPath);
                const base64 = Buffer.from(image, "binary").toString("base64");
                const imageBase64 = `data:image/${ext.split(".").pop()};base64,${base64}`;
                const userdata = {
                    username: body.username,
                    firstname: body.firstname,
                    lastname: body.lastname,
                    age: body.age,
                    email: body.email,
                    mobilenumber: body.mobilenumber,
                    city: body.city,
                    password: pwhash,
                    image: imageBase64
                }
                userDB.saveUser(userdata);
                communityDB.addCommunityTable(body.username);
                response.json({ status: true, text: "registration successful" });
            });
        } else if (isTaken) {
            response.json({ status: false, text: "Benutzername wird bereits verwendet!" });
        } else {
            response.json({ status: false, text: "Bitte alle Felder ausfüllen!" });
        }
    })
})

//Einloggen des Nutzers und versenden der SessionID
router.post("/login", async (request, response) => {
    let data = request.body;
    const usr = data.username;
    const pwd = data.password;
    if (await userDB.getUsername(usr)) {
        const pwHash = await userDB.getHash(usr);
        const state = await bcrypt.compare(pwd, pwHash);
        if (state) {
            sessionID = crypto.createHash("sha256")
                .update(crypto.randomUUID())
                .digest("hex");
            await userDB.updateUserSession(usr, sessionID);
            response.cookie('SessionID', sessionID).cookie("Username", usr).json({ status: "OK", sessionid: sessionID });
        } else {
            response.json({ status: "Username oder Passwort falsch!" });
        }
    } else {
        response.json({ status: "Username oder Passwort falsch!" });
    }

})

module.exports =
{
    router: router
};