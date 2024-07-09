import { cookieOption } from "../JWT/JWT.js";


const sendDriverToken = (driver, statusCode, res) => {

    // getting this token from the schema while saving the data
    const token = driver.getJWTToken();

    return res.status(statusCode)
        .cookie("driver-token", token, cookieOption)
        .json({
            success: true,
            driver_info: driver,
            driver_token: token,
        })
}


export default sendDriverToken