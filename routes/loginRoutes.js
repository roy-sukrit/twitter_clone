const experess = require('express');
const app = experess();
const router = experess.Router();
const bodyParser = require("body-parser")
const User = require('../schemas/UserSchema');

//Setting Template Engine
app.set("view engine","pug")
app.set("views","views")
app.use(bodyParser.urlencoded({ extended: false }));
const bcrypt = require('bcrypt');


router.get('/',(req,res,next) => {
    
    res.status(200).render("login")

})

router.post('/',async (req,res,next) => {
    let payload = req.body;
console.log("payload",payload);
    if(req.body.logUserName && req.body.logPassword){
        
        const user = await User.findOne({
            $or: [
                { userName:payload.logUserName },
                { email:payload.logUserName }
            ]
        })
            .catch((error) => {
                console.log(error);
                 payload.errorMessage = "Something Went Wrong";
                 res.status(200).render("login", payload);
            })
        console.log("user", user);

        if(user !== null){
            const result = await bcrypt.compare(req.body.logPassword,user.password)
            if(result === true){
                req.session.user = user;
                return res.redirect("/")
            }
            
        }

        payload.errorMessage = "Login Credentials Incorrect"
        return res.status(200).render("login",payload)

    }

    payload.errorMessage = "Make sure each fields have a valid value"

    res.status(200).render("login")

})



module.exports = router;
