const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const indicesSchema = new Schema({
    indexType: String,
    indexTypeDisplayName: String,
    scriptPath: String,
    env: String,
    indicesDeclaration: [
        { indexName: String, displayName: String }
    ]
});

module.exports = indicesSchema;