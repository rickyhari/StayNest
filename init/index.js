if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const axios = require("axios");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("connected to DB");
}

const initDB = async () => {
  await Listing.deleteMany({});
  console.log("Old data deleted");

  for (let obj of initData.data) {
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${obj.location}&key=${process.env.OPENCAGE_API_KEY}`;

      const response = await axios.get(url);

      let geometry = {
        type: "Point",
        coordinates: [0, 0], // fallback
      };

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;

        geometry = {
          type: "Point",
          coordinates: [lng, lat],
        };
      }

      const newListing = new Listing({
        ...obj,
        owner: "69fa6f5cc240f26fbb6dbb91",
        geometry,
      });

      await newListing.save();
      console.log(`Added: ${obj.title}`);
    } catch (err) {
      console.log(`Error in ${obj.title}:`, err.message);
    }
  }

  console.log("✅ Data was initialized with geometry");
  mongoose.connection.close();
};

main()
  .then(() => initDB())
  .catch((err) => console.log(err));