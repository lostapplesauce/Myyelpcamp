const mongoose = require('mongoose');
const Schema = mongoose.Schema

// An outline for the database with the necessary categories
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Review", reviewSchema);

