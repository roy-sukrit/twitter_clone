const experess = require('express');
const app = experess();
const router = experess.Router();
const bodyParser = require("body-parser")
const User = require('../schemas/UserSchema');

//Setting Template Engine
app.set("view engine","pug")
app.set("views","views")
app.use(bodyParser.urlencoded({ extended: false }));



router.get('/:id',(req,res,next) => {
    const postId = req.params.id;
    const payload ={
        pageTitle:"View Post",
        userLoggedIn:req.session.user,
        userLoggedInJS:JSON.stringify(req.session.user),
        postId
    }

    res.status(200).render("postsPage",payload)

})


module.exports = router;
