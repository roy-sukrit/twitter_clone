const experess = require('express');
const { requireLogin } = require('./middleware');
const app = experess();
const port = 3003;
const bodyParser = require('body-parser');
const mongoose = require('./database');
const session = require('express-session')
const path = require("path");


//Setting Template Engine
app.set("view engine","pug")
app.set("views","views")
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
    secret:"Sukrit",
    resave:true,
    saveUninitialized:false
}))
app.use(experess.static(path.join(__dirname + "/public")))

const server  = app.listen(port,()=>console.log("App Started"));

//Routes
const loginRoute = require('./routes/loginRoutes')
const registerRoutes = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout')

const postsApiRoute = require('./routes/api/posts');
const poststRoute = require('./routes/postRoutes')





app.get('/',requireLogin,(req,res,next) => {
    const payload ={
        pageTitle:"Home",
        userLoggedIn:req.session.user,
        userLoggedInJS:JSON.stringify(req.session.user)
    }

    console.log("payload",payload);
    res.status(200).render("home",payload)

})

app.use("/login",loginRoute)
app.use("/logout",logoutRoute)
app.use("/api/posts",postsApiRoute)

app.use("/post",requireLogin,poststRoute)


app.use("/register",registerRoutes)


