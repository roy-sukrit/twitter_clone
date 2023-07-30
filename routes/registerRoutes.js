const experess = require('express');
const app = experess();
const bodyParser = require("body-parser")
const router = experess.Router();
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');

//Setting Template Engine
app.set("view engine", "pug")
app.set("views", "views")
app.use(bodyParser.urlencoded({ extended: false }));


router.get('/', (req, res, next) => {

    res.status(200).render("register")

})

router.post('/', async (req, res, next) => {

    console.log("req body post", req.body);

    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const userName = req.body.userName.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    const payload = req.body;
    if (firstName && lastName && userName && email && password) {
        console.log("userName",userName);
        console.log("email",email);
        const user = await User.findOne({
            $or: [
                { userName },
                { email }
            ]
        })
            .catch((error) => {
                console.log(error);
                 payload.errorMessage = "Something Went Wrong";
                 res.status(200).render("register", payload);
            })
        console.log("user", user);


        if (user == null) {

            payload.password = await bcrypt.hash(password,10);
            console.log("payload",payload);

            const userCreated = await User.create(payload);
            console.log("userCreated", userCreated);
            req.session.user = userCreated;
            return res.redirect("/");
        }
        else{
            if(email == user.email){
                payload.errorMessage = "Email Already in use";

            }
            else{
                payload.errorMessage = "Username Already in use";

            }

            res.status(200).render("register", payload);

        }
    }

    else {
        payload.errorMessage = "Make sure each field has a valid value"
        res.status(200).render("register", payload)

    }

})



module.exports = router;
