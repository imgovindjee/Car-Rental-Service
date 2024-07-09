import bcrypt from 'bcryptjs'

import cloudinary from 'cloudinary'
import crypto from 'crypto'

import { User } from '../../schema/User/UserSchema.js';

import sendToken, { cookieOption } from '../../config/JWT/JWT.js';
import sendEmail from '../../lib/SendMail/SendMail.js';
import ErrorHandler from '../../common/ErrorCode.js'



// regex for email
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// regex for password
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;





// CONTROLLERS

// CONTROLLERS-1
// user signup
const signup = async (req, res) => {

    // retriving the data from the frontend
    const { name, email, password, avatar } = req.body

    // data validation form the frontend

    // 1. name of the user is valid or not
    if (name.length < 3) {
        return res.status(403).json({
            success: false,
            message: "Invalid Credientials",
        })
    }

    // 2. email entered by the user is valid or not
    if (!email.length || !emailRegex.test(email)) {
        return res.status(403).json({
            success: false,
            messgae: "Invaild Credential",
        })
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({
            success: false,
            message: "Invalid Credentails.."
        })
    }

    // 3. password entered by user is valid or not
    if (!password.length || !passwordRegex.test(password)) {
        return res.status(403).json({
            success: false,
            message: "Please, Enter the valid Credentails"
        })
    }

    // 4. user-avatar
    if (!avatar.length) {
        return res.status(403).json({
            success: false,
            message: "Please upload the avatar"
        })
    }


    // hashing the password
    bcrypt.hash(password, 10, async (error, hashPassword) => {
        // if error occurs while hahsing the password
        if (error) {
            return res.status(500).json({
                message: error.message,
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
        let newUser = new User({
            name,
            email,
            password: hashPassword,
            avatar: {
                public_id: cloud_data_of_avatar.public_id,
                url: cloud_data_of_avatar.secure_url
            }
        })

        await newUser.save()
            .then((data) => {
                sendToken(data, 200, res);
            })
            .catch((error) => {
                if (error.code === 11000) {
                    return res.status(500).json({
                        success: false,
                        message: "User may Already Exists",
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




// CONTROLLERS-2
// user signin
const signin = async (req, res) => {

    // retriving the data from the frontend
    const { email, password } = req.body

    // frontend data validation

    // 1. email
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Enter email",
        })
    }

    // 2. password check
    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Enter password",
        })
    }


    // 1. Email Search
    // and if found then just
    // 2. Password Match
    User.findOne({ email })
        .select("+password")
        .then((validUser) => {
            // console.log(validUser)
            if (!validUser) {
                // throw error
                return res.status(403).json({
                    success: false,
                    message: "Enter a valid credentails",
                })
            }


            // GOT THE VALID EMAIL
            // AND SUCCESS WHILE FINDING THE USER
            // 2. Valid password
            bcrypt.compare(password, validUser.password, (err, result) => {
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
                    sendToken(validUser, 200, res);
                }
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error,
            })
        })
}






// CONTROLLERS-3
// FORGET PASSWORD
const forgetPassword = async (req, res) => {

    // retriving the data from the frontend
    const { email } = req.body;


    // finding the user in the DB[SERVER] 
    await User.findOne({ email })
        .then(async (user) => {
            // if user don't exists
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User don't exists, Please enter a valid email"
                })
            }


            // if we have a regisetr user

            // accessing the reset password token
            const reset_token = user.getResetPasswordTOken();

            // saving the data without any validation
            await user.save({ validateBeforeSave: false })

            // password url
            const resetpasswordURL = `${req.protocol}://${req.get("host")}/user/password/reset/${reset_token}`;
            console.log(resetpasswordURL)


            // trying to sending email
            try {
                await sendEmail({
                    email: user.email,
                    subject: "Password recovery",
                    message: `Your Password reset token is: \n\n${resetpasswordURL} \n\nIf yoy don't request for reset of your password just ignore it`
                })

                return res.status(200).json({
                    success: true,
                    message: `Email Sent to ${user.email} successfully`
                })
            } catch (error) {
                await user.save({ validateBeforeSave: false });

                // console.log(error)
                return res.status(500).json({
                    message: "Error Occurs",
                    success: false,
                    error
                })
            }
        })
        .catch((error) => {
            // console.log(error)
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error,
            })
        })
}






// CONTROLLERS-4
// RESET PASSWORD
const resetPassword = async (req, res) => {

    // retriving the data from the frontend
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


    // creating the hashToken
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    // finding the user in the DB[SERVER]
    await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    })
        .then(async (user) => {
            // if User
            // dont exist
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Reset Password Token is Invalid or expired"
                })
            }

            // confirm that password
            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password Don't matches"
                })
            }

            // console.log(user)
            // Hashing the password
            bcrypt.hash(newPassword, 10, async (err, hashPassword) => {
                // if error occurs while hashing the password
                if (err) {
                    return res.status(500).json({
                        message: err.message,
                        success: false,
                    })
                }

                // updating the USER DETAILS IN THESEREVR[DB]
                user.password = hashPassword
                user.resetPasswordToken = undefined
                user.resetPasswordExpires = undefined
    
                // saving the updated data-to-DB
                await user.save()
                    .then(() => {
                        sendToken(user, 200, res)
                    })
                    .catch((error) => {
                        return res.status(500).json({
                            success: false,
                            message: "Error Saving the data back to servere",
                            message_err: error.message,
                            error,
                        })
                    })
            })

        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error,
            })
        })
}




// CONTROLLERS-5
// user LOGOUT
const logOut = async (req, res) => {
    return res.status(200).cookie("token", "", {
        ...cookieOption,
        expires: new Date(Date.now())
    })
        .json({
            success: true,
            message: "Logged out successfully",
        })
}




// CONTROLLERS-6
// user details
const getUserDetails = async (req, res) => {
    // console.log("Data:-",req.userId);

    // getting the user Details fomr the srever
    await User.findById(req.userId)
        .select("-password")
        .then((user) => {
            // if user 
            // dont exists
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Check your Email entered"
                })
            }

            return res.status(200).json({
                success: true,
                message: "User Details retrived successfully",
                user_info: user
            })
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                _message: error.message,
                error,
            })
        })
}




// CONTROLLERS-7
// UPDATE-PROFILE
const updateProfile = async (req, res) => {

    // LOGGED-in user id
    const { userId } = req;

    // retriving the data from the frontend
    const { name, email, avatar } = req.body

    // NOT NECCESARY TO VALIDATE
    // name validation
    if (!name || name.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Name Should be of min 3 Character"
        })
    }


    // data to be updated in the DB[SERVER]
    const user_data_to_be_updated = {
        name, email
    }


    // if avatar isn't empty
    if (avatar !== "") {
        await User.findById(userId)
            .then(async (user) => {
                // imageId--> .ie. public_id
                const public_id = user.avatar.public_id

                // DELETING THE PREVIOUS IMAGE
                await cloudinary.v2.uploader.destroy(public_id)

                // making the new IMAGE
                const cloud_data_of_avatar = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                    crop: "scale"
                })

                // add the new Data of avtaar to the user_data_to_be_uplaoded
                user_data_to_be_updated.avatar = {
                    public_id: cloud_data_of_avatar?.public_id,
                    url: cloud_data_of_avatar?.secure_url
                }
            })
            .catch((error) => {
                return res.status(500).json({
                    success: false,
                    message: "Error while DELEETING the AVATRA",
                    error
                })
            })
    }


    // savaing the data to the server
    await User.findByIdAndUpdate(userId, user_data_to_be_updated, {
        new: true,
        runValidator: true,
        useFindAndModify: false
    })
        .then((user) => {
            return res.status(200).json({
                success: true,
                message: 'Profile data Updated',
                user_info: user
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





// CONTROLLERS-8
// UPDATE PASSWORD
const updateUserPassword = async(req, res)=>{

    // accessing the data from the frontend
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

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
    await User.findById(userId)
        .select("+password")
        .then((user) => {
            // if driver
            // don't exists
            if (!user) {
                return next(new ErrorHandler("Invalid Reset Password token or it has been expired", 400))
            }

            // checking the password
            if (newPassword !== confirmPassword) {
                return next(new ErrorHandler("Password don't match", 400))
            }

            // Valid password and oldPassword
            bcrypt.compare(oldPassword, user.password, (err, result) => {
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
                        user.password = hashPassword
                        await user.save()
                            .then(() => {
                                sendToken(user, 200, res);
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









// ADMIN CONTROLLERS


// CONTROLLERS-1
// GET ALL USERS
const allUsers = async (req, res) => {
    // requesting for the access for all the user
    await User.find()
        .then((users) => {
            return res.status(200).json({
                success: true,
                message: "All users retrived successfully",
                all_users: users
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



// CONTROLLERS-2
// GET A USER USERS
const getAUser = async (req, res) => {

    // requesting to get a User from DB[SERVER]
    User.findById(req.params.id)
        .then((user) => {
            // if user don't exists
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Check your Email entered"
                })
            }

            return res.status(200).json({
                success: true,
                message: "user Retrived successfully",
                user_info: user
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





// CONTROLLERS-3
// GET UPDATING-THE_ADMIN-USERS-PROFILE
const updateAdminProfile = async (req, res, next) => {

    // retruving the data from the frontend
    const { name, email, role } = req.body

    // validating the data from the forntend
    if (!name || name.length < 3) {
        return next(new ErrorHandler("Enter a valid credentails", 400))
    }
    if (!email || !emailRegex.test(email)) {
        return next(new ErrorHandler("Enter a Valid Email", 400))
    }


    // upading the data to the servere
    await User.findByIdAndUpdate(req.params.id,
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
                message: "Data Updated siccessfully"
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






// CONTROLLERS-4
// GET DELETING-USERS
const deleteUser = async (req, res) => {

    // searching the user 
    // and DELETEING FOMR THE DB 
    await User.findById(req.params.id)
        .then(async (user) => {
            if (!user) {
                return res.status(403).json({
                    success: false,
                    message: "Please check the enetered email"
                })
            }

            // DELETING THE USER
            await user.deleteOne()
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        message: "User Deleted Successfuly"
                    })
                })
                .catch((error) => {
                    return res.status(500).json({
                        success: false,
                        message: "Erro While deleting the user"
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




export { signup, signin, logOut, forgetPassword, resetPassword, getUserDetails, updateProfile, updateUserPassword, allUsers, getAUser, updateAdminProfile, deleteUser }