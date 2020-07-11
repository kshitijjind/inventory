var express = require("express");
var app = express.Router();

var mongoose = require("mongoose");
var bodyParser = require('body-parser');

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
    assestid: String,
    assestname: String
});

nameSchema.set('versionKey', false);

var assestCol = mongoose.model("assest", nameSchema); //collection

//insert the assest in collection
app.post("/insert_assest", (req, res) => {
    var assestData = new assestCol(req.body);
    assestData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/add-assest.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//fetch assests from assest collection
app.get("/showassest", (req, res) => {
    assestCol.find()
        .then(function (result) {
            var assestdis = [];
            for (var i = 0; i < result.length; i++) {
                assestdis.push(result[i].assestname)
            }
            const lst = [...new Set(assestdis)];
            res.send(lst);
        })
        .catch(function (msg) {
            res.send({
                err: msg
            });
        });
});

//update the assest collection with respect to accept the request
app.get("/accept_upadate", function (req, res) {
    console.log(req.query.assestacceptrequestlist);
    var alist = req.query.assestacceptrequestlist.split(',');
    console.log(alist.length);
    for (let i = 0; i < alist.length; i++) {
        assestCol.deleteOne({
            assestname: alist[i]
        }).then(function (result) {}).catch(function () {

        });
    }

});

module.exports = app;