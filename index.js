const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const ExpressError = require('./utils/ExpressError.js');
const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');
const User = require('./models/user.js');

const port = process.env.PORT || 8080;

const dbUrl = process.env.ATLASDB_URL;

main()
.then(() => console.log("DB Connected Successfully!"))
.catch(err => console.log(err, "DB not Connected"));

async function main() {
    mongoose.connect(dbUrl);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/", listings);
app.use("/:id/reviews", reviews);

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    let {statusCode = 500, message = "Some Error Occurred"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(port, () => {
    console.log(`App is listening to port ${port}`);
});