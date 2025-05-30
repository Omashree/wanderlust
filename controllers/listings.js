const Listing = require('../models/listing.js');
const opencage = require('opencage-api-client');

module.exports.index = async (req, res) => {
    const { category, q } = req.query;
    let filter = {};
    let allListings;
    if (category && category !== "Trending") {
        filter.category = category;
    } 
    if (q) {
        const searchRegex = new RegExp(q, 'i');
        filter.$or = [
            { title: { $regex: searchRegex } },
            { description: { $regex: searchRegex } },
            { category: { $regex: searchRegex } },
            { location: { $regex: searchRegex } },
            { country: { $regex: searchRegex } }
        ];
    }
    if (Object.keys(filter).length > 0) {
        allListings = await Listing.find(filter);
    } else {
        allListings = await Listing.find({});
    }
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.image = { url, filename };
        newListing.owner = req.user._id;

        const geoData = await opencage.geocode({ q: newListing.location });

        if (geoData.status.code === 200 && geoData.results.length > 0) {
            const place = geoData.results[0];

            newListing.coordinates = {
                lat: place.geometry.lat,
                lng: place.geometry.lng
            };
        } else {
            console.warn('Geocoding failed for:', newListing.location);
            console.log('Status:', geoData.status.message);
            console.log('Total Results:', geoData.total_results);
        }

        await newListing.save();

        req.flash("success", "New Listing Created!");
        res.redirect("/");
    } catch (err) {
        console.error("Error creating listing:", err);
        req.flash("error", "Failed to create listing: " + err.message);
        next(err);
    }
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/");
};