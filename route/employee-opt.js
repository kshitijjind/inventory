var express = require("express");
var app = express.Router();
const nodemailer = require("nodemailer");

//sending email from contact
var transpoter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xxxxxxxxxxxxxx',
        pass: 'xxxxxxxxxxxxx'

    }
});

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
    assestacceptlist: String,
    assestrequestlist: String,
    assestacceptrequestlist: String
});

nameSchema.set('versionKey', false);

var empCol = mongoose.model("employee", nameSchema); //collection



//insert the product in collection
app.post("/insert_emp", (req, res) => {
    req.body['status'] = 0;
    req.body['assestlist'] = null;
    req.body['assestacceptlist'] = null;
    req.body['assestrequestlist'] = null;
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
    // var mailOptions = {
    //     from: 'xxxxxxxxx',
    //     to: req.query.email,
    //     subject: "Assest Ditribution",
    //     text: "you are given " + req.query.prolist
    // }
    // transpoter.sendMail(mailOptions, function (error, info) {
    //     if (error) console.log(error);
    //     else console.log('email sent: ' + info.response);
    // });
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

//employee recived with assert products
//show current order placed
app.get("/emp_asserted_products", (req, res) => {
    empCol.find({
            status: 1
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

//update the employee collection (status , assest list)
app.get("/update_assestacceptlist", function (req, resp) {
    console.log(req.query.prolist);
    empCol.findOneAndUpdate({
        _id: req.query.uid
    }, {
        $set: {
            status: 2,
            assestacceptlist: req.query.assestacceptlist
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

//reject the employee assiged assest items
app.get("/update_reject_assestacceptlist", function (req, resp) {
    console.log(req.query.prolist);
    empCol.findOneAndUpdate({
        _id: req.query.uid
    }, {
        $set: {
            status: 3,
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

//partial accept the employee  assest items
app.get("/partialaccept_assestacceptlist", function (req, resp) {
    empCol.findOneAndUpdate({
        _id: req.query.uid
    }, {
        $set: {
            status: 4,
            assestacceptlist: req.query.assestacceptlist
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

//employee requesting for assests
app.post("/emp_request_assest", function (req, resp) {
    empCol.findOneAndUpdate({
        empid: req.body.empid
    }, {
        $set: {
            assestrequestlist: req.body.assestrequestlist
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

//update the employee collection accept the assest lost request by the employee 
app.get("/accept_requestassestlist", function (req, resp) {
    empCol.findOneAndUpdate({
        _id: req.query.uid
    }, {
        $set: {
            status: 2,
            assestacceptrequestlist: req.query.assestacceptrequestlist
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

//reject the employee assest request 
app.get("/reject_emp_requestassestlist", function (req, resp) {
    empCol.findOneAndUpdate({
        _id: req.query.uid
    }, {
        $set: {
            status: 3,
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

//partial accept the employee  assest item requested 
app.get("/partialaccept_emp_assestreqest", function (req, resp) {
    empCol.findOneAndUpdate({
        _id: req.query.uid
    }, {
        $set: {
            status: 4,
            assestacceptrequestlist: req.query.assestacceptrequestlist
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