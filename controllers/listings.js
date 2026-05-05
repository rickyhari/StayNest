const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const { search } = req.query;
    let filter = {};
    let searchQuery = "";

    if (search) {
        searchQuery = search.trim();
        filter = {
            $or: [
                { title: new RegExp(searchQuery, "i") },
                { location: new RegExp(searchQuery, "i") }
            ]
        };
    }

    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings, searchQuery });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists!!");
    res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let { listing } = req.body;
  const newListing = new Listing(listing);
  //const newListing = new Listing(req.body.listing);

  const location = req.body.listing.location;

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${process.env.OPENCAGE_API_KEY}`;

  const response = await axios.get(url);

  // console.log(response.data.results[0].geometry);
  // res.send("done!");

  if (response.data.results.length === 0) {
    req.flash("error", "Invalid location, please enter a valid place");
    return res.redirect("/listings/new");
  }

  const { lat, lng } = response.data.results[0].geometry;

  newListing.geometry = {
    type: "Point",
    coordinates: [lng, lat],
  };

  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists!!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  // 🔹 Step 0: existing listing fetch karo
  let existingListing = await Listing.findById(id);

  let updatedData = { ...req.body.listing };

  // 🔹 Step 1: location change check
  if (updatedData.location !== existingListing.location) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${updatedData.location}&key=${process.env.OPENCAGE_API_KEY}`;

    const response = await axios.get(url);

    if (response.data.results.length === 0) {
      req.flash("error", "Invalid location, please enter a valid place");
      return res.redirect(`/listings/${id}/edit`);
    }

    const { lat, lng } = response.data.results[0].geometry;

    updatedData.geometry = {
      type: "Point",
      coordinates: [lng, lat],
    };
  }

  // 🔹 Step 2: update after validation
  let listing = await Listing.findByIdAndUpdate(id, updatedData, { returnDocument: "after" });

  // 🔹 Step 3: image update
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!!");
    res.redirect("/listings");
};