import mongoose, { model } from "mongoose"

import validator from "validator"


const bookingSchema = new mongoose.Schema({
    location: {
        type: String,
        required: [true, "Please Provide Location"],
    },
    package: {
        type: String,
        required: [true, "Please Provide the package"],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Please Sign in to access this region.."],
    },
    car: {
        type: mongoose.Schema.ObjectId,
        ref: "RentCar",
        required: true,
    }
},
    {
        timestamps: true,
    }
)


export const Booking = mongoose.model.Booking || model("Booking", bookingSchema);