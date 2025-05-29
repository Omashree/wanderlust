const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const initdata = require('./data.js');
const opencage = require('opencage-api-client');
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const dbUrl = process.env.ATLASDB_URL;

main()
.then(res => console.log(res, "DB Connected Successfully!"))
.catch(err => console.log(err, "DB not Connected"));

async function main() {
    mongoose.connect(dbUrl);
};

const initDB = async () => {
    try {
        await Listing.deleteMany({});

        initdata.data = initdata.data.map((obj) => ({
            ...obj,
            owner: '68389ed2d13a1d5dec8b4540'
        }));

        const listingsWithCoordinates = [];
        for (let listingData of initdata.data) {
            if (listingData.location) {
                try {
                    const geoData = await opencage.geocode({ q: listingData.location });
                    if (geoData.status.code === 200 && geoData.results.length > 0) {
                        const place = geoData.results[0];
                        listingData.coordinates = {
                            lat: place.geometry.lat,
                            lng: place.geometry.lng
                        };
                    } else {
                        console.warn(`Geocoding failed for "${listingData.location}": Status ${geoData.status.message}, Results ${geoData.total_results}`);
                        listingData.coordinates = null;
                    }
                } catch (geocodeError) {
                    console.error(`Error geocoding "${listingData.location}":`, geocodeError.message);
                    listingData.coordinates = null;
                }
            } else {
                console.warn(`Listing "${listingData.title}" has no location property to geocode.`);
                listingData.coordinates = null;
            }
            listingsWithCoordinates.push(listingData);
        }
        await Listing.insertMany(listingsWithCoordinates);
        console.log("Data was initialized with coordinates");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};

initDB();