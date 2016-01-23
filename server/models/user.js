var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    link_karma: {
        type: Number,
        required: true
    },
    comment_karma: {
        type: Number,
        required: true
    },
    created: {
        type: Number,
        required: true
    },
    created_utc: {
        type: Number,
        required: true
    },
    over_18: {
        type: Boolean,
        required: true
    },
    is_gold: {
        type: Boolean,
        required: true
    },
    is_mod: {
        type: Boolean,
        required: true
    },
    has_verified_email: {
        type: Boolean,
        required: false
    },
    access_token: {
        type: String,
        required: false
    },
    refresh_token: {
        type: String,
        required: true
    },
    tokenExpires: {
        type: Number,
        required: true
    }
});

// schema.methods.generateHash = function(password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// schema.methods.validPassword = function(password) {
//     return bcrypt.compareSync(password, this.local.password);
// };

module.exports = mongoose.model('User', schema);
//module.exports = mongoose.model('sessions', schema);

//example model
// name: 'armastevs',
// created: 1267808541,
// created_utc: 1267808541,
// link_karma: 1660,
// comment_karma: 861,
// over_18: true,
// is_gold: true,
// is_mod: true,
// has_verified_email: true,
// id: '3x80r'

//findOne example
// UserDB.findOne({
//     name: profile.name
// }, function(err, usr) {

//     console.log('user in findOne=', usr)

//     process.nextTick(function() {
//         return done(null, profile);
//     });
// });