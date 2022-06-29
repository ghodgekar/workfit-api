const express = require('express');
const app = express();
const config=require("./config/config.json");
const routes = require('./routes/routes');
const port =process.env.PORT || 8000
app.use(express.static('public'))

app.use(function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.use("/",routes)


app.listen(process.env.PORT || 8000)
