const experess = require('express');
const app = experess();
const router = experess.Router();
const bodyParser = require("body-parser")
const User = require('../schemas/UserSchema');

//Setting Template Engine

app.use(bodyParser.urlencoded({ extended: false }));
const bcrypt = require('bcrypt');


router.get('/', (req, res, next) => {

    if (req.session) {
        req.session.destroy(()=>{
            res.redirect('/login')
        })
    }

    // res.status(200).render("login")

})

module.exports = router;
