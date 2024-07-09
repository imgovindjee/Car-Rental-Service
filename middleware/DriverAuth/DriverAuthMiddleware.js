import jwt from 'jsonwebtoken'

import { Driver } from '../../schema/Driver/DriverModel.js';
import ErrorHandler from '../../common/ErrorCode.js';




const AuthenticatedDriver = async (req, res, next) => {
    // console.log(req.cookies["driver-token"])

    // accessing the token fomr the cookie
    const driverToken = req.cookies["driver-token"]

    if (!driverToken) {
        return next(new ErrorHandler("Please login to access this region", 400));
    }

    // DRIVER IS LOGGED-IN
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

    // DECODING THE DATA FROM THE driverToken
    const decodedData = jwt.verify(driverToken, JWT_SECRET_KEY)
    // console.log(decodedData)


    // storing the data into the req[body]
    // req.driverId = await Driver.findById(decodedData?._id);
    req.driverId = decodedData?._id
    next();
}


export default AuthenticatedDriver