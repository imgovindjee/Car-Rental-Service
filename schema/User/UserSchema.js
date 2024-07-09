import mongoose, { model } from "mongoose";

import validator from "validator";

import jwt  from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'




const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter name'],
        maxLength: [30, "Name shouldn't exceed 30 character"],
        minLength: [3, "Name should be atleast 3 Character long"]
    },
    email: {
        type: String,
        required: [true, "Please enter the Email"],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter password"],
        minLength: [8, "Password should be 8 Character long"],
        select: false,
    },
    role: {
        type: String,
        default: "user",
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
},
    {
        timestamps: true,
    }
)




// password hashing
// userSchema.pre("save", async function (next) {
//     // if already hashed
//     // leave it
//     if (!this.isModified("password")) {
//         next()
//     }

//     // if new password
//     // then hash it
//     this.password = await bcrypt.hash(this.password, 10);
// })


// JWT TOKEN SETUP
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: 15 * 24 * 60 * 60 * 1000
    })
}

// compare Password
userSchema.methods.comparePassword = async function (userEnteredPassword) {
    return await bcrypt.compare(userEnteredPassword, this.password);
}

// RESET PASSWORD TOKEN
userSchema.methods.getResetPasswordTOken = function () {
    // token generation
    const resetToken = crypto.randomBytes(20).toString("hex")

    // reset token auth..
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // time at which token expires
    this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

    return resetToken;
}



export const User = mongoose.model.User || model("User", userSchema)