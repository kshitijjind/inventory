var express = require("express");
var path = require("path");
var bodyparser = require("body-parser");

var app = express();

app.use(express.urlencoded({
    "extended": false
}));

var insert_products = require("./route/warehouse-insert-inventory");
app.use("/index", insert_products);

var insert_orders = require("./route/place-order");
app.use("/order", insert_orders);


var customer_orders = require("./route/customer-order");
app.use("/custorder", customer_orders);

var employee = require("./route/employee-opt");
app.use("/emp", employee);

var email = require("./route/email");
app.use("/email", email);

var recipt = require("./route/cash-recipt");
app.use("/recipt", recipt);

var invoice = require("./route/invoice");
app.use("/invoice", invoice);

var assest = require("./route/assest-opt");
app.use("/assest", assest);

var user = require("./route/user-login");
app.use("/user", user);

var vendor = require("./route/vendor-opt");
app.use("/vendor", vendor);

var bill = require("./route/bill");
app.use("/bill", bill);

app.use(express.static("pages")); //imp line for .html

app.use("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "index.html"));
});


var PORT = 8000;
app.listen(PORT, () => {
    console.log("started on " + PORT);
});

app.use((req, res, next) => {
    res.status(404).send("Page not found- invalid URL");
})