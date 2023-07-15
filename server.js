const experess = require('express');
const app = experess();
const port = 3003;

//Setting Template Engine
app.set("view engine","pug")
app.set("views","views")
const server  = app.listen(port,()=>console.log("App Started"));


app.get('/',(req,res,next) => {



    const payload ={
        pageTitle:"Home"
    }


    res.status(200).render("home",payload)

})