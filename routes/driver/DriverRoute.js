import express  from 'express'


import AuthenticatedDriver from '../../middleware/DriverAuth/DriverAuthMiddleware.js'
import AuthorizeRole from '../../middleware/UserAuth/UserAdminMiddleware.js'

import { deleteDriver, driverLogOut, driverSignin, forgetPassword, getADriver, getAllDrivers, getDriverDetail, registerNewDriver, resetPassword, updataDriverProfile, updateDriverPassword, updateDriverProfile_Via_ADMIN } from '../../controllers/Driver/DriverControllers.js'





const driverRoute = express.Router()




// ROUTES

// ROUTE-1
// REGISTER A USER[DRIVER]
driverRoute.post("/register", registerNewDriver)



// ROUTE-2
// Sign-In A USER[DRIVER]
driverRoute.post("/signin", driverSignin)




// ROUTE-3
// LOGGED-OUT A USER[DRIVER]
driverRoute.get("/logout", driverLogOut)




// ROUTE-4
// FORGET PASSWROD
driverRoute.post("/password/forget", forgetPassword)




// ROUTE-5
// RESET PASSWROD
driverRoute.put("/password/reset/:token", resetPassword)




// ROUTE-5
// RESET PASSWROD
driverRoute.put("/password/update", updateDriverPassword)





// ROUTE-7
// GET A DRIVER DETAIL WHO IS LOGGED IN
driverRoute.get("/get-driver-detail", AuthenticatedDriver, getDriverDetail)




// ROUTE-8
// UPDATE THE DRIVER DETAILS
driverRoute.put("/update-driver-profile", updataDriverProfile)






// ADMIN ROUTES


// ROUTE-9
// GET DRIVER DETAILS
driverRoute.get("/admin/all-drivers", AuthorizeRole("admin"), getAllDrivers)



// ROUTE-10
// OTHERS FUNCTIONALITY
driverRoute.route("/admin/:id")
    .post(AuthorizeRole("admin"), getADriver)
    .put(AuthorizeRole("admin"), updateDriverProfile_Via_ADMIN)
    .delete(deleteDriver)




export default driverRoute