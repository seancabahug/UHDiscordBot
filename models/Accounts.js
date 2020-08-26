const mongoose = require('mongoose');

var accountSchema = new mongoose.Schema({
    firstName: {
        required: true,
        type: String
    },
    lastName: {
        required: true,
        type: String
    },
    oid: {
        required: true,
        type: String
    },
    estsAuthPersistent: {
        required: true,
        type: String
    },
    lastUsedToken: {
        required: true,
        type: String
    }
});

module.exports = new mongoose.Model('Accounts', accountSchema);