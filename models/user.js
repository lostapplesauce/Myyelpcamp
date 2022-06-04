const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema; 
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    //Required and unique being true makes it so can't be ignored
    //Unique makes it so can't repeat
    email: {
        type: String,
        required: true,
        unique: true
    }
});
// Don't need to specify username and password due to next line
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model( 'User', UserSchema);