// jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// Connect to MongoDB using the recommended approach
mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Add this option to avoid deprecation warnings
});

// Define the user schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// Create a User model
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", async function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
        // Store hash in your password DB.
        try {
            // Create a new user document
            const newUser = new User({
                email: req.body.username,
                password: hash,
            });

            // Save the user document (using async/await)
            await newUser.save();
            console.log("User registered successfully!");
            res.render("secrets");
        } catch (error) {
            console.error("Error registering user:", error);
            // Handle the error (e.g., display an error page)
            res.status(500).send("Error registering user. Please try again later.");
        }
    });
});

//Using Promises
// app.post("/login", function (req, res) {
//     const username = req.body.username;
//     const password = req.body.password;

//     User.findOne({ email: username })
//         .then((foundUser) => {
//             if (foundUser && foundUser.password === password) {
//                 res.render("secrets");
//             } else {
//                 // Handle invalid login (e.g., show an error message)
//                 res.render("login", { errorMessage: "Invalid credentials" });
//             }
//         })
//         .catch((error) => {
//             console.error("Error finding user:", error);
//             // Handle other errors (e.g., show an error page)
//             res.status(500).send("Error finding user. Please try again later.");
//         });
// });

//async/await
app.post("/login", async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });
        const passwordMatch = await bcrypt.compare(password, foundUser.password);

        if (passwordMatch) {
            res.render("secrets");
        } else {
            // Handle invalid login (e.g., show an error message)
            res.render("login", { errorMessage: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Error finding user:", error);
        // Handle other errors (e.g., show an error page)
        res.status(500).send("Error finding user. Please try again later.");
    }
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
