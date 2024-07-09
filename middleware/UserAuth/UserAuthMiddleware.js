import jwt from 'jsonwebtoken'


import ErrorHandler from '../../common/ErrorCode.js';



const AuthMiddleware = async (req, res, next) => {
    // console.log(req.cookies["token"])

    // accessing the token fomr the cookie
    const token = req.cookies["token"]

    if (!token) {
        return next(new ErrorHandler("Please login to access this region", 400));
    }

    // USER IS LOGGED-IN
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

    // DECODING THE DATA FROM THE TOKEN
    const decodedData = jwt.verify(token, JWT_SECRET_KEY)
    // console.log(decodedData)


    // storing the data into the req[body]
    req.userId = decodedData?._id
    next();
}


export default AuthMiddleware