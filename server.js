const express = require('express');
const app = express();
const config=require("./config/config.json")
const routes = require('./routes/routes');
const port =config.port

app.use(function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

const PORT = process.env.PORT || 8080;
// app.use("/",routes);
app.get('/', (req, res) => {
    res.send('Hello World, from express');
});

app.listen(PORT,()=>{ console.log("App Running On Port "+port)})
