import mongoose, { model } from "mongoose";



const rentCarSchema = new mongoose.Schema({
    carName: {
        type: String,
        required: [true, "Declear the name of the car"],
        minLength: [3, "Car name must be of atleast of 3 Character"]
    },
    model: {
        type: Number,
        required: [true, "Please Enter a Car Model"]
    },
    category: {
        type: String,
        required: [true, "Please provide the category of the car"]
    },
    price: {
        type: Number,
        required: [true, "Plase enter CAR price"],
        max: [999999, "Price can't exceed INR.9,99,999 "]
    },
    transmission: {
        type: String,
        required: [true, "Provide the car transmission"],
        maxLength: [6, "Transmission type should be of atleast 6 character"]
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        }
    ],
    occupancy: {
        type: Number,
        min: [4, "Atleast occupency should bt 4"],
        required: [true, "Please provide the max. occupency of Car"]
    },
    fuelType: {
        type: String,
        required: [true, "Plase provide the fuel Type"]
    },
    rating: {
        type: Number,
        default: 0,
    },
    number_plate: {
        type: String,
        unique: true,
        required: [true, "Plase provide the plate number of the car"],
        uppercase: true,
        minLength: [8, "Car Number plate should be atleast 8 Character long"],
    },
    number_of_trips: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            name: {
                type: String,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
        }
    ]
},
    {
        timestamps: true
    }
)



export const RentCar = mongoose.model.RentCar || model("RentCar", rentCarSchema);