var express = require("express");
var app = express.Router();

var mongoose = require("mongoose");
var bodyParser = require('body-parser');
const {
    response
} = require("express");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.Promise = global.Promise;

//databse connectivity
mongoose.connect("mongodb://localhost:27017/inventory", {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log(err);
});

//collection schema
var nameSchema = new mongoose.Schema({
    username: String,
    password: String,
    designation: String
});

nameSchema.set('versionKey', false);

var userCol = mongoose.model("userCredentials", nameSchema); //collection

//insert the user into the collections
app.post("/create_user", (req, res) => {
    var userData = new userCol(req.body);
    userData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/create-user.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//check the user and than login
app.post("/check_user", function (req, res) {
    userCol.findOne({
            $and: [{
                username: req.query.uname,
                password: req.query.pass
            }]
        })
        .then(function (result) {
            console.log(result.designation);
            console.log(result);
            res.send(result);
        })
        .catch(function (msg) {
            res.send({
                err: msg
            });
        });
});
module.exports = app;