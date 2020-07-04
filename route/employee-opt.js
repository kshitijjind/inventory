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
    empid: String,
    empname: String,
    fathername: String,
    dob: String,
    email: String,
    empdsg: String,
    doj: String,
    supname: String,
    dept: String,
    septcode: String,
    empsalary: Number,
    status: Number,
    assestlist: String,
});

nameSchema.set('versionKey', false);

var empCol = mongoose.model("employee", nameSchema); //collection



//insert the product in collection
app.post("/insert_emp", (req, res) => {
    req.body['assestlist'] = null;
    req.body['status'] = 0;
    var empData = new empCol(req.body);
    empData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/employee.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//show all the new employee to the company
app.get("/newemp", (req, res) => {
    empCol.find({
            status: 0
        })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (msg) {
            res.json({
                err: msg
            });
        });
});

//update the employee collection (status , product list)
app.get("/update_pro_list", function (req, resp) {
    console.log(req.query.prolist);
    empCol.findOneAndUpdate({
        _id: req.query.uid
    }, {
        $set: {
            status: 1,
            assestlist: req.query.prolist
        }
    }, {
        new: true
    }).then((docs) => {
        if (docs) {
            resp.send({
                success: true,
                data: docs
            });
        } else {
            resp.send({
                success: false,
                data: "no such user exist"
            });
        }
    })

});

module.exports = app;