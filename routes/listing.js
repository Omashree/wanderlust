const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing, saveRedirectUrl } = require('../middleware.js');
const listingController = require('../controllers/listings.js');
const userController = require('../controllers/users.js');

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), wrapAsync(userController.login));

router.get("/logout", userController.logout);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;