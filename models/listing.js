const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const categories = require("../utils/categories");
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=600&auto=format&fit=crop";

const listingSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default: DEFAULT_IMAGE,
      set: (v) => (v === "" ? DEFAULT_IMAGE : v),
    },
  },
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    enum: categories,
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
