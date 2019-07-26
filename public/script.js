const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scriptSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    env: String,
    path: String,
    args: Array
});

module.exports = scriptSchema;