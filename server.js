const experess = require('express');
const app = experess();
const port = 3003;

const server  = app.listen(port,()=>console.log("App Started"));


app.get('/',(req,res,next) => {
    res.status(200).send("Ok")

})