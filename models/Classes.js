const mongoose = require('mongoose');

var classSchema = new mongoose.Schema({
    id: {
        required: true,
        type: String
    },
    displayName: {
        required: true,
        type: String
    }
});

module.exports = new mongoose.Model('Class', classSchema);