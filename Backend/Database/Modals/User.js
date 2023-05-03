import mongoose from "mongoose";
import bcrypt from "bcrypt"

const USchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        avatar: {
            public_id: String,
            url: String
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        post: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }],
        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }],
      
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }],


    }
);

USchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
export const User = mongoose.model("User", USchema);
export default User;
