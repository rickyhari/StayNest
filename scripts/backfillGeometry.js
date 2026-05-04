if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const axios = require("axios");

async function updateAllListings() {
  await mongoose.connect("mongodb://127.0.0.1:27017/staynest");

  let listings = await Listing.find({});

  for (let listing of listings) {
    if (!listing.geometry || listing.geometry.coordinates.length === 0) {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${listing.location}&key=${process.env.OPENCAGE_API_KEY}`;

      const response = await axios.get(url);

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;

        listing.geometry = {
          type: "Point",
          coordinates: [lng, lat],
        };

        await listing.save();
        console.log(`Updated: ${listing.title}`);
      }
    }
  }

  console.log("All listings updated!");
  mongoose.connection.close();
}

updateAllListings();