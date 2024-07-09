import ErrorHandler from "../../common/ErrorCode.js";

import { Booking } from "../../schema/Booking/BookingModel.js";





// CONTROLLERS-1
// NEW BOOKING
const newBooking = async (req, res, next) => {

    // accessing the data from the frontend
    const { location, packages, car, user } = req.body;

    // validating the data from the frontend

    // 1.location
    if (!location) {
        return next(new ErrorHandler("Enter the Location", 400))
    }

    // 2.car
    if (!car) {
        return next(new ErrorHandler("Enter the car name", 400));
    }

    // 3.package
    if (!packages) {
        return next(new ErrorHandler("Please provide the Package", 400));
    }


    // requesting for the saving the ata to the server[DB]
    await Booking.create({
        user,
        location,
        car,
        package: packages
    })
        .then((booking) => {
            return res.status(200).json({
                success: true,
                message: "Booking created successfully",
                booking_details: booking
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                message_error: error.message,
                error,
            })
        })
}






// CONTROLLERS-2
// GET A BOOKING's
const getABookings = async (req, res) => {

    // requesting for the access of the details for the user BOOKINGs
    await Booking.findById(req.params.id)
        .populate("user", "name email avatar")
        .populate("car", "carName model price fuelType rating number_plate images category")
        .then((booking) => {
            // if booking don't exists
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: `Booking don't exists for this ID: ${req.params.id}`
                })
            }

            return res.status(200).json({
                success: true,
                message: "Booking Details retrived successfully",
                booking_details: booking
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                message_error: error.message,
                error,
            })
        })
}






// CONTROLLERS-3
// GET MY BOOKING's [BOOKING HISTORY FOR THE LOGGED-IN USER]
const getMyBooking = async (req, res) => {

    // retriving the userId form the header
    // const { userId } = req;

    // accessing the data from the frontend
    const { userId } = req.body


    // accessing the current logged-in user booking details
    Booking.find({ user: userId })
        .populate("user", "name email avatar")
        .populate("car", "carName model price fuelType rating number_plate images category")
        .then((booking) => {
            // console.log("user:- ", booking.user)
            // console.log("userId:- ", userId)

            return res.status(200).json({
                success: true,
                message: "Your Booking Details retrived successfully",
                booking_details: booking
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                message_error: error.message,
                error,
            })
        })
}





// ADMIN CONTROLLERS

// CONTRLLERS-1 [ADMIN]
// GET ALL THE BOOKING
const getAllBookings = async (req, res) => {

    // requesting for access of the booking history
    await Booking.find()
        .then((booking) => {
            return res.status(200).json({
                success: true,
                message: "All Booking history retrived successfully",
                booking_history_info: booking
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                message_error: error.message,
                error,
            })
        })
}





// CONTROLLERS-2 [ADMIN]
// DELETE BOOKING
const deleteBooking = async (req, res) => {

    // retriving the id form the URL
    const { id } = req.params;

    // requesting for the delete of the user's booking
    await Booking.findById(id)
        .then(async (booking) => {
            // if booking don't exists
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: `No such booking exists with the ID: ${id}`
                })
            }

            // DELETING THE BOOKING
            await booking.deleteOne()
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        message: "Booking Deleted successfully",
                    })
                })
                .catch((error) => {
                    return res.status(500).json({
                        success: false,
                        message: "Internal server error, while deleteing the BOOKING",
                        message_error: error.message,
                        error,
                    })
                })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                message_error: error.message,
                error,
            })
        })
}






export { newBooking, getABookings, getMyBooking, getAllBookings, deleteBooking }