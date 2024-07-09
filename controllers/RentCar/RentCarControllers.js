import { RentCar } from "../../schema/RentCar/RentCarSchema.js"

import ErrorHandler from "../../common/ErrorCode.js";

import uploadFilesToCloudinary from "../../lib/Cloudinary/Cloudinary.js";





// CONTROLLERS-1
// REGISTER CAR / VEHICLES
const registerCarVehicles = async (req, res, next) => {
    
    // retriving the data from the forntend
    const { carName, model, category, price, transmission, images, occupancy, fuelType, rating, number_plate, number_of_trips, reviews } = req.body;

    // Data validation

    // 1.carName
    if (!carName || carName.length < 3) {
        return next(new ErrorHandler("Enter the CarName", 400))
    }
    // 2.model
    if (!model) {
        return next(new ErrorHandler("Enter the model", 400))
    }
    // 3.price
    if (!price) {
        return next(new ErrorHandler("Enter the price", 400))
    }
    // 4.transmission
    if (!transmission || transmission.length < 6) {
        return next(new ErrorHandler("Enter the transmission", 400))
    }
    // 5.occupency
    if (!occupancy || occupancy.length < 4) {
        return next(new ErrorHandler("Enter the occupancy", 400))
    }
    // 6.fuelType
    if (!fuelType) {
        return next(new ErrorHandler("Enter the fuelType", 400))
    }
    // 7.number_plate
    if (!number_plate || number_plate.length < 8) {
        return next(new ErrorHandler("Enter the number_plate", 400))
    }
    // 8.number_of_trip
    if (!number_of_trips) {
        return next(new ErrorHandler("Enter the number_of_trips", 400))
    }
    // 9.category
    if (!category) {
        return next(new ErrorHandler("Enter the category", 400))
    }





    const formatedData_of_car = {
        carName, model, category, price, transmission, occupancy, fuelType, rating, number_of_trips, number_plate,
        images: await uploadFilesToCloudinary(images),
        reviews
    }

    // requesting for the regisetring the car details
    await RentCar.create(formatedData_of_car)
        .then((rentcar) => {
            return res.status(200).json({
                success: true,
                message: "Car Register successfully",
                register_car_details: rentcar
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error_message: error.message,
                error,
            })
        })
}



// ADMIN CONTROLLED CONTROLLERS


// CONTROLLERS-2
// UPDATE A CAR-DETAILS
const updateRentCar = async (req, res, next) => {

    // accessing the data from the frontend
    const { price, images, fuelType, rating, number_plate, number_of_trips, reviews } = req.body;

    // requesting for the search of the file
    await RentCar.findById(req.params.id)
        .then(async (rentcar) => {
            // if rentcar don't exists
            if (!rentcar) {
                return next(new ErrorHandler(`No such car exists with the ID: ${req.params.id}`, 404))
            }

            
            // formated data to be send to the server
            const data_to_be_updated = {
                price,
                fuelType,
                rating,
                number_of_trips,
                number_plate,
                images: await uploadFilesToCloudinary(images),
                reviews,
            }

            // UPDATING THE DATA TO THE SERVER
            await RentCar.findByIdAndUpdate(req.params.id,
                data_to_be_updated,
                {
                    new: true,
                    runValidators: true,
                    useFindAndModify: false
                }
            )
                .then((_rentcar) => {
                    return res.status(200).json({
                        success: true,
                        message: "Details Updated Successfully",
                        rent_cra_info: _rentcar
                    })
                })
                .catch((error) => {
                    if (error.code === 11000) {
                        return res.status(500).json({
                            success: false,
                            message: "Rent Car may Already Exists",
                            _message: error.message,
                            error,
                        })
                    }

                    return res.status(500).json({
                        success: false,
                        message: "Internal Error, While updating the Data",
                        error_message: error.message,
                        error,
                    })
                })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error_message: error.message,
                error,
            })
        })
}





// CONTROLLERS-3
// DELETE THE CAR
const deleteRentedCar = async (req, res, next) => {

    // requesting for the delete of the RENT-CAR
    await RentCar.findById(req.params.id)
        .then(async (rentcar) => {
            // if rentcar don't exists
            if (!rentcar) {
                return next(new ErrorHandler(`No such car exists with the ID: ${req.params.id}`, 404))
            }

            // requesting for the delete of the RENT-CAR
            await RentCar.findByIdAndDelete(req.params.id)
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        message: "User Deleted Successfully",
                    })
                })
                .catch((error) => {
                    return res.status(500).json({
                        success: false,
                        message: "Error occurs at deleting the user",
                        error_message: error.message,
                        error,
                    })
                })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error_message: error.message,
                error,
            })
        })
}





// NON-ADMIN CONTRROLLED CONTROLLERS


// CONTROLLERS-4
// GET ALL CAR-DETAILS
const getAllRentCar = async (req, res) => {

    // retriving the data form the SERVER[DB] 
    await RentCar.find()
        .then((rentcar) => {
            return res.status(200).json({
                success: true,
                message: "Rented Car Data retrived successfully",
                rented_car_details: rentcar
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error_message: error.message,
                error,
            })
        })
}




// CONTROLLERS-5
// GET A CAR-DETAILS
const getARentedCar = async (req, res, next) => {

    // accessing the data from the SERVER[DB]
    await RentCar.findById(req.params.id)
        .then((rentcar) => {
            // if car don't exist
            if (!rentcar) {
                return next(new ErrorHandler(`No Such car exists with this carId:- ${req.params.id}`, 404))
            }

            return res.status(200).json({
                success: true,
                message: "Rent car details retrived successfully",
                rented_car_details: rentcar,
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error_message: error.message,
                error,
            })
        })
}






export { registerCarVehicles, getAllRentCar, getARentedCar, deleteRentedCar, updateRentCar }