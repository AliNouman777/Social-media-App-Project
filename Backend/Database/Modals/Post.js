import mongoose, { Schema, model } from "mongoose";

const PSchema = new mongoose.Schema({
    image: {
        public_id: String,
        url: String
    },
    caption: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comments: [{

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        comment: {
            type: String,
            required: true
        }
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
});

export const Post = model("Post", PSchema);