const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const ejsMate = require("ejs-mate"); // ejs-mate is for... to add css to ejs pages
const { v4: uuidv4 } = require('uuid');

// related to session
const session = require("express-session");
const mongoose = require("mongoose");
 
const sessionOptions = session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie:  {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
});

// session middlewares
app.use(sessionOptions);

// middleware for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "css")));
app.use(express.urlencoded({extended: true}));  // middleware for parse post req data 



// configeration for passport
const User = require("./model/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





// creating connection of MongoDB database
main()
   .then((res) => {
     console.log("connection successful");
 })
 .catch(err => console.log(err));
  async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/blogging');
}




// Routes
// main page route
app.get("/blogging", async (req,res) => {
    let user = "";
   await User.find({})
    .then((res) => {
        user = res;
    })
    .catch((err) => {
         console.log(err);
    });
    
   // console.log(user);
    let isLogin = req.isAuthenticated();
    res.render("index.ejs", { user, isLogin });
});



// add page route
app.get("/blogging/addblog", (req,res) => {
    let isLogin = req.isAuthenticated();
    res.render("addblog.ejs", { isLogin });
});


//  add blog route
app.post("/blogging/addblog/new", async (req,res) => {
     let user1 = new User({
        blog: req.body.blog,
        username: uuidv4(),
     });

    await user1.save();
    res.redirect("/blogging");
});






// Signup / Login / Logout Routes
// sign up get
app.get("/blogging/signup", (req,res) => {
    res.render("signup.ejs");
});


// sign up post 
app.post("/blogging/signup",async (req,res) => {
    try {
       let {username, password} = req.body;
       const newUser = new User({username: username});
       const registeredUser = await User.register(newUser,password);
       res.redirect("/blogging"); 

    } catch(err) {
        res.send(err);
    } 
});



// routes for login
//get route for login
app.get("/blogging/login", (req,res) => {
    res.render("login.ejs");
});

// post route for login
app.post("/blogging/login", passport.authenticate("local", {failureRedirect: "/wrong"}) , async (req,res) => {
    res.redirect("/blogging");
});


// post req for logout 
app.post("/blogging/logout", (req,res) => {
    req.logout((err) => {
        if(err) {
            res.send("some Error Occured");
        } else {
            res.redirect("/blogging");
        }
    });
});




// in case of wrong username or password
app.use("/wrong", (req,res) => {
    res.send("Wrong Username or Password");
});


// this will listen all req and send pge not exist
app.use((req,res) => {
    res.send("page doesnt exist !");
});


app.listen((port), () => {
    console.log(`app is listning on port ${8080}`);
  });






