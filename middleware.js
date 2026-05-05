const Listing = require("./models/listing");
const Review = require("./models/review");
const {listingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const multer = require("multer");
const { storage } = require("./cloudConfig");

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // type check
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ExpressError(400, "Only image files allowed"), false);
    }
  },
});

module.exports.uploadMiddleware = (req, res, next) => {
  upload.single("listing[image]")(req, res, (err) => {
    if (err) {
    // console.log(err);
      let message = err.message;
      if (err.code === "LIMIT_FILE_SIZE") {
        message = "File too large (Max 5MB)";
      }
      const redirectUrl =
        req.method === "PUT" ? req.originalUrl : "/listings/new";
      req.flash("error", message);
      return res.redirect(redirectUrl);
    }
    next();
  });
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
    let{id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing!!");
        return res.redirect(`/listings/${id}`);
    };
    next();
}

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let{id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You did not create this review!!");
        return res.redirect(`/listings/${id}`);
    };
    next();
}