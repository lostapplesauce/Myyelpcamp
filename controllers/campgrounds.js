const Campground = require('../models/campground');
// Colt in the video said he got this from Mapbox docs since he can never remeber it
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
// geocoder contains the two methods we want, forward and reverse geocode.
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary');

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds });
}

//exports function named renderNewForm which routes to new.ejs
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
                // always have to put .send() at the end or it won't work.
        }).send()
        // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    //These campground.something came from the campground model
    //Can use error handling here to handle that don't exist or something else
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save();
    //console.log(campground); to help get information about photos
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Campground does not exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Can not find Campground');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    // pushing on image so doesn't replace all existing images
    // set imgs to own variable due to mongo arguement we set up in models. 
    // use spread operation (...imgs) to get images not yet on array
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            //this deletes image off cloudinary profile
            await cloudinary.uploader.destroy(filename);
        }
        //pulling images out of the array. Getting images. Getting filename field from image form 
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })

    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect(`/campgrounds`);
}