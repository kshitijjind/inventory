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
    assestname: String,
    empid: String,
    status: String
});

nameSchema.set('versionKey', false);

var assestCol = mongoose.model("assest", nameSchema); //collection

//insert the assest in collection
app.post("/insert_assest", (req, res) => {
    req.body['empid'] = null;
    req.body['status'] = 0;
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
    assestCol.find({
            status: 0
        })
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
app.get("/accept_update", function (req, res) {
    console.log(req.query.assestacceptrequestlist);
    var alist = req.query.assestacceptrequestlist.split(',');
    console.log(alist.length);
    for (let i = 0; i < alist.length; i++) {
        assestCol.findOneAndUpdate({
            assestname: alist[i]
        }, {
            $set: {
                status: 1,
                empid: req.query.empid,
            }
        }, {
            new: true
        }).then(function (result) {}).catch(function () {

        });
    }

});

//update the assest collection when emp donate its assest to the some other emp
app.get("/updatedonar_whendonate", function (req, res) {
    console.log(req.query.empid);
    console.log(req.query.assestdonatelist);
    console.log(req.query.donarid);
    var donarlist = req.query.assestdonatelist.split(',');
    console.log(donarlist.length);
    for (let i = 0; i < donarlist.length; i++) {
        assestCol.findOneAndUpdate({
            $and: [{
                assestname: donarlist[i],
                empid: req.query.empid
            }]
        }, {
            $set: {
                status: 2,
                empid: req.query.donarid,
            }
        }, {
            new: true
        }).then(function (result) {}).catch(function () {

        });
    }

});

//show all assest
//fetch assests from assest collection
app.get("/showallassest", (req, res) => {
    assestCol.find()
        .then(function (result) {
            res.send(result);
        })
        .catch(function (msg) {
            res.send({
                err: msg
            });
        });
});

module.exports = app;