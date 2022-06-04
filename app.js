// currently in development mode. App hasn't been deployed yet
// Node_environment is not in production yet
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// can display env variables using:
// console.log(process.env.SECRET); if secret was a variable

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session"); //used a few times
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError"); //Used to help errors. Bulk is another file
const methodOverride = require("method-override");
//Two security features
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const MongoDBStore = require("connect-mongo"); //this sytnax can be found in the docs: link is google doc. Don't need (session) after as in video

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
//"mongodb://localhost:27017/yelp-camp"
mongoose.connect(dbUrl, {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useUnifiedTopology:true
  // useFindandModify: false
  /* all these aren't needed in new Mongoose update */
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs"); //setting up ejs for views folder
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

//setting this up to be ready for heroku. Adding this line in video 576
const secret = process.env.SECRET || "thisshouldbeabettersecret!"; 

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on("error", function(e) {
  console.log("Session Store Error: ", e);
})

const sessionConfig = {
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
//this automatically enables all 11 middleware this comes with.
//app.use(helmet());

//These are all parameters for helmet and what is allowed
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://*.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: [
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
      ],
      childSrc: ["blob:"],
    },
  })
);

app.use(passport.initialize());
//have to make sure app.use(session(sessionConfig)) is before passport.session
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  //reminder: middleware always needs to call next();
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Oh no, something ain't right";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
