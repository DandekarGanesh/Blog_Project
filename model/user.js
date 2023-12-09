const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    blog: {
        type: String,
        default: false,
    } 
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);