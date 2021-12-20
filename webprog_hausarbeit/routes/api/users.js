//Import der Module
const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const UserDB = require("../../static/collections/userCollection");

//Router und Datenbank deklarieren
let router = express.Router();
const userDB = new UserDB();

//Deklarieren der Datenbank
const CommunityDB = require("../../static/collections/communityCollection")
let communityDB = new CommunityDB();

//Anzeige eines Nutzerprofiles
router.get("/edituserprofile/:username", async (request, response) => {
    let username = request.params.username;
    let user = await userDB.getUserName(username);
    let message = {
        text: `
        <ul id="user-details">
            <li>
            <img src="${user.image}" height="200px" width="400px">
            <h3>Benutzername: ${user.username}</h3>
            <h4>Vorname: ${user.firstname}</h4>
            <h4>Nachname: ${user.lastname}</h4>
            <h4>Alter: ${user.age}</h4>
            <h4>Email-Adresse: ${user.email}</h4>
            <h4>Telefonnummer: ${user.mobilenumber}</h4>
            <h4>Wohnort: ${user.city}</h4>
            <input class="hidden" type="text" id="id" name="id" value="${user.id}">
            <input type="button" onclick="javascript:fetchEditForm(username)" value="Profil bearbeiten">
            </li>
        </ul>
            `
    };
    response.end(JSON.stringify(message));
});

//Formular zur Datenbearbeitung des Nutzerprofiles
router.get("/edit/:username", async (request, response) => {
    let username = request.params.username;
    let user = await userDB.getUserName(username);
    let message = {
        text: `
        <div class="item-container">
            <form class="form" onsubmit="updateUserProfile(event,this)" enctype="multipart/form-data">
            <input class="hidden" type="text" id="id" name="id" value="${user.id}">
            <label>Vorname:</label>
            <input type="text" id="firstname" name="firstname" value="${user.firstname}">
            <label>Nachname:</label>
            <input type="text" id="lastname" name="lastname" value="${user.lastname}">
            <label >Alter:</label>
            <input type="number" id="age" name="age" value="${user.age}">
            <label >Email:</label>
            <input type="email" id="email" name="email" value="${user.email}">
            <label >Telefonnummer:</label>
            <input type="number" id="mobilenumber" name="mobilenumber" value="${user.mobilenumber}">
            <label >Wohnort:</label>
            <input type="text" id="city" name="city" value="${user.city}">
            <label >Bild:</label>
            <input type="file"id="image" name="image" value="">
            <img src="${user.image}" height="200px" width="400px">
            <input type="submit"  value="Bearbeiten">
            <input type="button" onclick="javascript:reload()" value="Abbrechen">
            </form>
        </div>
            `
    };
    response.end(JSON.stringify(message));
});

//Hier werden die Update-Anfragen eines einzelnen Artikels bearbeitet
router.put("/:username", async (request, response) => {
    const form = formidable({ multiples: true });
    let username = await userDB.getUser(request.params.username);
    let id = username.id;
    form.parse(request, (err, body, picture) => {
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
            let userData = {
                firstname: body.firstname,
                lastname: body.lastname,
                age: body.age,
                email: body.email,
                mobilenumber: body.mobilenumber,
                city: body.city,
                image: imageBase64,
                id: id
            }
            userDB.updateUser(userData);
        });
    });
    response.json({ status: true, text: "article posted" });
});

//Hier wird die Community-Anfrage bearbeitet und 
//alle Registrierten User dem Client zugesendet
router.get("/community/:username", async (request, response) => {
    let users = await userDB.getAllUser(request.params.username);
    response.end(JSON.stringify(users));
});

// Es werden alle vorhandenen Freundschaftsanfragen an den Client gesendet.
router.get("/community/friendrequests/:username", async (request, response) => {
    let users = await communityDB.getAllFriendRequests(request.params.username);
    let data = [];
    for (let user of users) {
        data[data.length] = new Object(await userDB.getUserId(user.userid));
    }
    response.end(JSON.stringify(data));
});

// Es werden alle Freunde des Nutzers verschickt
router.get("/community/friends/:username", async (request, response) => {
    let users = await communityDB.getAllFriends(request.params.username);
    let data = [];
    for (let user of users) {
        data[data.length] = new Object(await userDB.getUserId(user.userid));
    }
    response.end(JSON.stringify(data));
});

// Eine Freundschaftsanfrage wird an einen User gesendet
router.get("/friendrequest/:id/:username", async (request, response) => {
    let username = request.params.username;
    let userid = await userDB.getUser(username);
    let friend = await userDB.getUserId(request.params.id);
    if (await communityDB.checkFriendRequest(username, friend.username)) {
        console.log("bereits erfragt")
    } else {
        communityDB.sendFriendRequest(username, userid.id, friend.username);
    }
    response.json({ status: true, text: "friendrequest sent" });
});

// Window zum Annehmen oder Ablehnen einer Freundschatsanfrage
router.get("/friend/:id", async (request, response) => {
    let id = request.params.id;
    let user = await userDB.getUserId(id);
    let message = {
        text: `
        <ul id="user-details">
            <li>
            <img src="${user.image}" height="200px" width="400px">
            <h3>Benutzername: ${user.username}</h3>
            <h4>Vorname: ${user.firstname}</h4>
            <h4>Nachname: ${user.lastname}</h4>
            <h4>Alter: ${user.age}</h4>
            <h4>Wohnort: ${user.city}</h4>
            <input class="hidden" type="text" id="id" name="id" value="${user.id}">
            <input type="button" onclick="javascript:acceptFriendRequest(${user.id})" value="Akzeptieren">
            <input type="button" onclick="javascript:declineFriendRequest(${user.id})" value="Ablehnen">
            </li>
        </ul>
            `
    };
    response.end(JSON.stringify(message));
});

// Window zur Ausgabe der Details eines bestimmmten Freundes
router.get("/friendshow/:id", async (request, response) => {
    let id = request.params.id;
    let user = await userDB.getUserId(id);
    let message = {
        text: `
        <ul id="user-details">
            <li>
            <img src="${user.image}" height="200px" width="400px">
            <h3>Benutzername: ${user.username}</h4>
            <h4>Vorname: ${user.firstname}</h4>
            <h4>Nachname: ${user.lastname}</h4>
            <h4>Alter: ${user.age}</h4>
            <h4>Wohnort: ${user.city}</h4>
            <input class="hidden" type="text" id="id" name="id" value="${user.id}">
            <input type="button" onclick="javascript:declineFriendRequest(${user.id})" value="Freundschaft beenden">
            <input type="button" onclick="javascript:reload()" value="--Zurück--">
            </li>
        </ul>
            `
    };
    response.end(JSON.stringify(message));
});

//Hier werden die Detail-Anfragen eines einzelnen Users der Community bearbeitet, und senden einer Freundschaftsanfrage
router.get("/:id", async (request, response) => {
    let id = request.params.id;
    let user = await userDB.getUserId(id);
    let message = {
        text: `
        <ul id="user-details">
            <li>
            <img src="${user.image}" height="200px" width="400px">
            <h3>Benutzername: ${user.username}</h3>
            <h4>Vorname: ${user.firstname}</h4>
            <h4>Nachname: ${user.lastname}</h4>
            <h4>Alter: ${user.age}</h4>
            <h4>Wohnort: ${user.city}</h4>
            <input class="hidden" type="text" id="id" name="id" value="${user.id}">
            <input id="button" type="button" onclick="javascript:sendFriendRequest(${user.id})" value="Freundschaftsanfrage senden">
            <input id="button" type="button" onclick="javascript:reload()" value="Zurück">
            </li>
        </ul>`
    };
    response.end(JSON.stringify(message));
});

// Freundschaftsanfrage löschen
router.delete("/friendrequest/:username/:id", async (request, response) => {
    let username = request.params.username;
    let friendId = request.params.id;
    let friend = await userDB.getUserId(friendId);
    communityDB.deleteFriendRequest(username, friendId);
    communityDB.deleteFriend(username, friend.username);
    response.json({ status: true, text: "Friendrequest deleted" });
});

// Freundschaftsanfrage akzeptieren
router.put("/friendrequest/:username/:id", async (request, response) => {
    let username = request.params.username;
    let userId = await userDB.getUserName(username);
    let friendId = request.params.id;
    let friend = await userDB.getUserId(friendId);
    communityDB.acceptFriendRequest(username, friendId);
    communityDB.addFriend(username, friend.username, userId.id);
    response.json({ status: true, text: "Friendrequest accepted" });
});

module.exports = router;
