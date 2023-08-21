const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

router.get("/", (req, res, next) => {

    console.log("req sessionn profile",req.session);
    const data = {
        pageTitle: req.session.user.userName,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }
    
    console.log("profile get ==>",data);

    res.status(200).render("profilePage", data);
})

router.get("/:userName", async (req, res, next) => {
    console.log("req usernam ==>",req.params.userName, req.session.user);

    var payload = await getPayload(req.params.userName, req.session.user);
    
    res.status(200).render("profilePage", payload);
})

router.get("/:userName/replies", async (req, res, next) => {

    var payload = await getPayload(req.params.userName, req.session.user);
    payload.selectedTab = "replies";
    
    res.status(200).render("profilePage", payload);
})

async function getPayload(userName, userLoggedIn) {
    console.log("getPayload",userName,userLoggedIn);
    var user = await User.findOne({ userName: userName })

    if(user == null) {

        user = await User.findById(userName);

        if (user == null) {
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }
    }

    return {
        pageTitle: user.userName,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }
}


router.get("/:username/following", async (req, res, next) => {

    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "following";
    
    res.status(200).render("followersAndFollowing", payload);
})

router.get("/:username/followers", async (req, res, next) => {

    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "followers";
    
    res.status(200).render("followersAndFollowing", payload);
})

module.exports = router;