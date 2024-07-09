import bcrypt from 'bcryptjs'

import crypto from 'crypto'
import cloudinary from 'cloudinary'


import { Driver } from '../../schema/Driver/DriverModel.js';

import sendDriverToken from '../../config/JWT_Driver/JWT_Driver.js';
import { cookieOption } from '../../config/JWT/JWT.js';
import sendEmail from '../../lib/SendMail/SendMail.js';

import ErrorHandler from '../../common/ErrorCode.js';




// regex for email
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// regex for password
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;





// CONTROLLERS


// CONTROLLER-1
// ADD A NEW DRIVER
const registerNewDriver = async (req, res) => {

    // accessing the data from the forntend
    const { name, email, password, carName, avatar, car_plate_number, car_category } = req.body


    // data validation form the frontend

    // 1. name of the user is valid or not
    if (name.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Invalid Credientials",
        })
    }

    // 2. email entered by the user is valid or not
    if (!email.length || !emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            messgae: "Invaild Credential",
        })
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Credentails.."
        })
    }

    // 3. password entered by user is valid or not
    if (!password.length || !passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Please, Enter the valid Credentails"
        })
    }

    // 4. user-avatar
    if (!avatar.length) {
        return res.status(400).json({
            success: false,
            message: "Please upload the avatar"
        })
    }

    // 5. car-number-plate
    if (!car_plate_number || car_plate_number.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid Car-Number"
        })
    }

    // 6. carName
    if (!carName.length) {
        return res.status(400).json({
            success: false,
            message: "Please provide the carName"
        })
    }

    // 7. car categry
    if (!car_category.length) {
        return res.status(400).json({
            success: false,
            message: "Please upload the car-category"
        })
    }



    // Hashing the password
    bcrypt.hash(password, 10, async (err, hashPassword) => {
        // if error occurs while hahsing the password
        if (err) {
            return res.status(500).json({
                message: err.message,
                success: false,
            })
        }


        // creating the data to be saved in the SERVER-DB 

        // CLOUDINARY UPLOAD OF THE USER-PROFILE-IMAGE
        const cloud_data_of_avatar = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        })
        // console.log("AVATAR:- ", cloud_data_of_avatar)

        // DATA FOR THE SEREVR-DB
        // USER-INSTANCE
        let newDriver = new Driver({
            name,
            email,
            password: hashPassword,
            carName,
            car_category,
            car_plate_number,
            avatar: {
                public_id: cloud_data_of_avatar?.public_id,
                url: cloud_data_of_avatar?.secure_url
            }
        })

        // saving the new-driver details
        await newDriver.save()
            .then((driver) => {
                // console.log(driver)
                sendDriverToken(driver, 200, res);
            })
            .catch((error) => {
                if (error.code === 11000) {
                    return res.status(500).json({
                        success: false,
                        message: "Driver may Already Exists",
                        error,
                        _message: error.message,
                    })
                }
                return res.status(500).json({
                    success: false,
                    message: "Internal Server Error",
                    _message: error.message,
                    error
                })
            })
    })
}







// CONTROLLER-2
// DRIVER SIGN IN
const driverSignin = async (req, res, next) => {

    // accessing the data form the frontend
    const { email, password } = req.body;

    // validating the data from the frontend

    // 1. emial check
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid credentails.."
        })
    }

    // 2. password check
    if (!password || !passwordRegex.test(password)) {
        return res.sttaus(400).json({
            success: false,
            message: "Enetr a valid credentails"
        })
    }


    // findnng the DRIVER-USER from the server[DB]
    await Driver.findOne({ email })
        .select("+password")
        .then(async (driver) => {
            // if DRIVER
            // don't exists
            if (!driver) {
                return res.status(401).json({
                    success: false,
                    message: "Please check the credentails, Once again"
                })
            }


            // GOT THE VALID EMAIL
            // AND SUCCESS WHILE FINDING THE DRIVER
            // 2. Valid password or not
            bcrypt.compare(password, driver.password, (err, result) => {
                // if some error occur while password compare
                if (err) {
                    return res.status(403).json({
                        success: false,
                        message: "Error Occur while login, Please Try Again",
                        _message: err.message,
                        error: err
                    })
                }

                if (!result) {
                    return res.status(403).json({
                        success: false,
                        message: "Enter a valid password or email"
                    })
                } else {
                    sendDriverToken(driver, 200, res);
                }
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}







// CONTROLLER-3
// DRIVER LOG-OUT
const driverLogOut = async (req, res) => {
    return res.status(200).cookie("driver-token", "",
        {
            ...cookieOption,
            expires: new Date(Date.now())
        }
    )
        .json({
            success: true,
            message: "User-Driver logged out successfully"
        })
}







// CONTROLLER-4
// FORGET PASSWORD 
// AND SENDING E-MAIL TO THE USER FOR RESET PASSWORD
const forgetPassword = async (req, res, next) => {

    // accessing the data form the forntend
    const { email } = req.body;

    // finding the user-DRIVRE in the DB[SERVER]
    await Driver.findOne({ email })
        .then(async (driver) => {
            // if DRIVER
            // Don't exists
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: "Driver not found",
                })
            }


            // if we have a regisetr DRIVER

            // accessing the reset password token
            const reset_token = driver.getResetPasswordTOken();

            // saving the data without any validation
            await driver.save({ validateBeforeSave: false })

            // password url
            const resetpasswordURL = `${req.protocol}://${req.get("host")}/user/password/reset/${reset_token}`;
            console.log(resetpasswordURL)


            // trying to sending email
            try {
                await sendEmail({
                    email: "shree098765shree@gmail.com",
                    subject: "Password recovery",
                    message: `Your Password reset token is: \n\n${resetpasswordURL} \n\nIf yoy don't request for reset of your password just ignore it`
                })

                return res.status(200).json({
                    success: true,
                    message: `Email Sent to ${driver.email} successfully`
                })
            } catch (error) {
                await driver.save({ validateBeforeSave: false });

                // console.log(error)
                return res.status(500).json({
                    message: "Error Occurs",
                    success: false,
                    error
                })
            }
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}







// CONTROLLER-5
// RESET PASSWORD
const resetPassword = async (req, res, next) => {

    // accessing the data from the frontend
    const { newPassword, confirmPassword } = req.body

    // validiating the data
    if (!newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Please Enter the Credentials"
        })
    }

    // if user enter password is flfilling the PASSWORD SETTING CRETRIA
    if (!passwordRegex.test(newPassword) || !passwordRegex.test(confirmPassword)) {
        return res.status(401).json({
            success: false,
            message: "Please, Enter the valid Credentails[Password]"
        })
    }

    // token isn't available
    if (!req.params.token) {
        return res.status(400).json({
            success: false,
            message: "Token is missing or invalid"
        })
    }

    // creating a hash-token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    // finding the driver form the SEREVR[DB]
    await Driver.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
    })
        .then((driver) => {
            // if driver
            // don't exists
            if (!driver) {
                return next(new ErrorHandler("Invalid Reset Password token or it has been expired", 400))
            }

            // checking the password
            if (newPassword !== confirmPassword) {
                return next(new ErrorHandler("Password don't match", 400))
            }

            // Hashing the password
            bcrypt.hash(newPassword, 10, async (err, hashPassword) => {
                // if error occurs while hahsing the password
                if (err) {
                    return res.status(500).json({
                        message: err.message,
                        success: false,
                    })
                }

                driver.password = hashPassword
                driver.resetPasswordToken = undefined
                driver.resetPasswordExpires = undefined

                // saving the driver
                await driver.save()
                    .then(() => {
                        sendDriverToken(driver, 200, res);
                    })
                    .catch((error) => {
                        return res.status(500).json({
                            success: false,
                            message: "Internal Server Error, while saving the DRIVER DATA",
                            _message: error.message,
                            error
                        })
                    })
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}







// CONTROLLER-6
// UPDATE/CHANGE PASSWORD
const updateDriverPassword = async (req, res, next) => {

    // accessing the data from the frontend
    const { driverId, oldPassword, newPassword, confirmPassword } = req.body;

    // validiating the data
    if (!newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Please Enter the Credentials"
        })
    }

    // if user enter password is flfilling the PASSWORD SETTING CRETRIA
    if (!passwordRegex.test(newPassword) || !passwordRegex.test(confirmPassword)) {
        return res.status(401).json({
            success: false,
            message: "Please, Enter the valid Credentails[Password]"
        })
    }

    // requesting for the access of the DRIVER
    await Driver.findById(driverId)
        .select("+password")
        .then((driver) => {
            // if driver
            // don't exists
            if (!driver) {
                return next(new ErrorHandler("Invalid Reset Password token or it has been expired", 400))
            }

            // checking the password
            if (newPassword !== confirmPassword) {
                return next(new ErrorHandler("Password don't match", 400))
            }

            // Valid password and oldPassword
            bcrypt.compare(oldPassword, driver.password, (err, result) => {
                // if some error occur while password compare
                if (err) {
                    return res.status(403).json({
                        success: false,
                        message: "Error Occur while login, Please Try Again",
                        _message: err.message,
                        error: err
                    })
                }

                if (!result) {
                    return res.status(403).json({
                        success: false,
                        message: "Enter a Old Password"
                    })
                } else {
                    // Hashing the password
                    bcrypt.hash(newPassword, 10, async (err, hashPassword) => {
                        // if error occurs while hahsing the password
                        if (err) {
                            return res.status(500).json({
                                message: err.message,
                                success: false,
                            })
                        }

                        // saving the driver
                        driver.password = hashPassword
                        await driver.save()
                            .then(() => {
                                sendDriverToken(driver, 200, res);
                            })
                            .catch((error) => {
                                return res.status(500).json({
                                    success: false,
                                    message: "Internal Server Error, while saving the DRIVER DATA",
                                    _message: error.message,
                                    error
                                })
                            })
                    })
                }
            })

        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}







// CONTROLLER-7
// GET DRIVER DETAILS
const getDriverDetail = async (req, res) => {

    // requesting the server to give the data
    await Driver.findById(req.driverId)
        .then((driver) => {
            // if driver 
            // don;t exists
            if (!driver) {
                return next(new ErrorHandler("Invalid Reset Password token or it has been expired", 400))
            }

            return res.status(200).json({
                success: true,
                message: "Driver details retrived successfully",
                driver_info: driver
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}




// CONTROLLER-8
// UPDATE A DRIVER PROFILE
const updataDriverProfile = async (req, res, next) => {

    // accessing the detail from the frontend
    const { driverId, email, name } = req.body;

    // validating the data from the forntend
    if (!name || name.length < 3) {
        return next(new ErrorHandler("Enter a valid credentails", 400))
    }
    if (!email || !emailRegex.test(email)) {
        return next(new ErrorHandler("Enter a Valid Email", 400))
    }


    // requesting for the search of the driver
    await Driver.findByIdAndUpdate(driverId,
        {
            name, email
        },
        {
            new: true,
            runValidator: true,
            useFindAndModify: true,
        }
    )
        .then((driver) => {
            return res.status(200).json({
                success: true,
                message: "Data Updated Successfully",
                updated_info: driver
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}







// ADMIN CONTROLLERS



// CONTROLLER-9
// GET ALL THE DRIVER DETAILS
const getAllDrivers = async (req, res, nxet) => {
    await Driver.find()
        .then((driver) => {
            return res.status(200).json({
                success: true,
                message: "All Details Retrived Successfully",
                drivers_detailed_info: driver
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}





// CONTROLLER-10
// GET ALL THE DRIVER DETAILS
const getADriver = async (req, res, next) => {
    // accessing the driver from the server
    await Driver.findById(req.params.id)
        .then((driver) => {
            // if driver 
            // don;t exists
            if (!driver) {
                return next(new ErrorHandler(`Driver don't exist for this ID:-${req.params.id}`, 404))
            }

            return res.status(200).json({
                success: true,
                message: "Driver details retrived successfully",
                driver_info: driver
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}





// CONTROLLER-11
// GET ALL THE DRIVER DETAILS
// INCLUDE ROLE-FOR-DRIVER
const updateDriverProfile_Via_ADMIN = async (req, res, next) => {
    // retruving the data from the frontend
    const { name, email, role } = req.body

    // validating the data from the forntend
    if (!name || name.length < 3) {
        return next(new ErrorHandler("Enter a valid credentails", 400))
    }
    if (!email || !emailRegex.test(email)) {
        return next(new ErrorHandler("Enter a Valid Email", 400))
    }
    if(!role){
        return next(new ErrorHandler("Enter a Role", 400))
    }

    // updating the data to the servere
    await Driver.findByIdAndUpdate(req.params.id,
        {
            name, email, role
        },
        {
            new: true,
            runValidator: true,
            useFindAndModify: false
        })
        .then(() => {
            return res.status(200).json({
                success: true,
                message: "Data Updated successfully"
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}






// CONTROLLER-12
// GET ALL THE DRIVER DETAILS
const deleteDriver = async (req, res, next) => {

    // accessing the driver from the server for deleting
    await Driver.findById(req.params.id)
        .then(async (driver) => {
            // if driver 
            // don't exists
            if (!driver) {
                return next(new ErrorHandler(`Driver don't exist for this ID:-${req.params.id}`, 400))
            }


            // deleting the driver
            await driver.deleteOne()
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        message: "Driver Deleted Successfuly"
                    })
                })
                .catch((error) => {
                    return res.status(500).json({
                        success: false,
                        erro_message: error.message,
                        message: "Error While deleting the driver",
                        error,
                    })
                })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error
            })
        })
}




export { registerNewDriver, driverSignin, driverLogOut, forgetPassword, resetPassword, updateDriverPassword, getDriverDetail, updataDriverProfile, getAllDrivers, getADriver, updateDriverProfile_Via_ADMIN, deleteDriver }