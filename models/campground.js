const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

//making another schema to nest in the bigger schema
const ImageSchema = new Schema({
    url: String,
    filename: String
})

//defining a function named thumbnail. virtual always needs a .get() attached to it
//virtual doesn't store the information onto the database or model
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

//this is so virtuals are passed through to schema on the webpage via the JSON docs
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    // on left is name; on right is variable type.
    title: String,
    price: Number,
    images: [ImageSchema],
    // got this format from mongoose location doc setup
    geometry: {
        type: {
            type: String,
            enum: ['Point'], //This has to be 'Point' but can have other options too
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

//The goal of this is to match the MapBox requirements to my schema so popup works
// Adding properties field via virtual because don't want it saved 
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

// Querey middleware is 'findOneAndDelete' 
// and it has to match method of campground delete in app.js
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);