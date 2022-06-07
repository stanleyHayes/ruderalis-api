const mongoose = require("mongoose");
const {Schema, model} = require("mongoose");

const marijuanaReviewSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    marijuana: {
        type: Schema.Types.ObjectId,
        ref: 'Marijuana',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    visible: {
        type: Boolean,
        default: false
    },
    useful: {
        type: [
            {
                user: {type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
                response: {type: String, enum: ['yes', 'no'], required: true},
                createdAt: {type: Date, default: Date.now()}
            }
        ]
    },
    spam: {
        type: [
            {
                user: {type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
                createdAt: {type: Date, default: Date.now()}
            }
        ]
    },
    inappropriate: {
        type: [
            {
                user: {type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
                createdAt: {type: Date, default: Date.now()}
            }
        ]
    }
}, {timestamps: {createdAt: true, updatedAt: true}});


const MarijuanaReview = model('MarijuanaReview', marijuanaReviewSchema);

module.exports = MarijuanaReview;