import mongoose, { model } from "mongoose";

import validator from "validator";

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'




const driverSchema = new mongoose.Schema({
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
        default: "driver",
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
    carName: {
        type: String,
        required: [true, "Please provide the name of the car"]
    },
    car_plate_number: {
        type: String,
        unique: true,
        uppercase: true,
        minLength: [8, "Car number plate should be atleast 8 characters"],
        required: [true, "Please provide the plate number of the car"]
    },
    number_of_trips: {
        default: 0,
        type: Number
    },
    reviews: [
        {
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true
            },
        }
    ],
    status: {
        type: String,
        default: "free"
    },
    car_category: {
        type: String,
        required: [true, "Please provide the car category"]
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
},
    {
        timestamps: true,
    }
)




// password hashing
// driverSchema.pre("save", async function (next) {
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
driverSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: 15 * 24 * 60 * 60 * 1000
    })
}

// compare Password
driverSchema.methods.comparePassword = async function (userEnteredPassword) {
    return await bcrypt.compare(userEnteredPassword, this.password);
}

// RESET PASSWORD TOKEN
driverSchema.methods.getResetPasswordTOken = function () {
    // token generation
    const resetToken = crypto.randomBytes(20).toString("hex")

    // reset token auth..
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // time at which token expires
    this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

    return resetToken;
}





export const Driver = mongoose.model.Driver || model("Driver", driverSchema)