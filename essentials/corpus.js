const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const corpusSchema = new Schema({
    name: String,
    path: {
        type: String,
        unique: true
    },
    size: Number,
    lastModified: Number,
    indices: {
        readability: Object,
        lexdiv: Object,
        misc: Object,
        tokens: Array,
        tokensNum: Array,
        vocabulary: Array,
        vocabularyNum: Array
    }
});

module.exports = corpusSchema;