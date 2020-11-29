const mongoose = require('mongoose');

var accountSchema = new mongoose.Schema({
    discordId: {
        required: true,
        type: String
    },
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
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    estsAuthPersistent: {
        required: true,
        type: String
    },
    lastUsedToken: {
        type: String
    },
    lastSyncAttempt: {
        type: Date
    },
    lastSuccessfulSync: {
        type: Date
    }
});

module.exports = new mongoose.Model('Account', accountSchema);