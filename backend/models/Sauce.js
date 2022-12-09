const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, required: true },
    dislikes: { type: Number, required: true },
    usersLiked: {
        type: [{
            type: String 
        }], required: true
    },
    usersDisliked: {
        type: [{
            type: String
        }], required: true
    },
});

module.exports = mongoose.model('Sauce', sauceSchema);

// "userId":"63934ae608b6ba14a8eb4490"
// "name":"sdfsd",
// "manufacturer":"sdfsdf",
// "description":"sdfsdf",
// "mainPepper":"dsfsd",
// "heat":2,
