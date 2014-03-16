var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/redditjs');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("Connected to db");
});

module.exports = {

    getDB: function() {
        return db;
    }

}