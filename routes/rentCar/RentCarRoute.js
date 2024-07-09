import express from 'express'


import AuthorizeRole from '../../middleware/UserAuth/UserAdminMiddleware.js'

import { deleteRentedCar, getAllRentCar, getARentedCar, registerCarVehicles, updateRentCar } from '../../controllers/RentCar/RentCarControllers.js'



const rentCarRouter = express.Router()





// ROUTES CONTROLLERS...

// ROUTE-1
// TO REGISTER A CAR
rentCarRouter.post("/admin/register-vehicle", AuthorizeRole("admin"), registerCarVehicles)


// ROUTE-2
// TO GET ALL CAR DETAILS
rentCarRouter.get("/all-car-details", getAllRentCar)


// ROUTE-3
// TO GET A CAR DETAILS
rentCarRouter.get("/get-a-car/:id", getARentedCar)



// ROUTE-4
// TO UPDATE CAR DETAILS and DELETE RENT CAR
rentCarRouter.route("/admin/:id")
        .post(AuthorizeRole("admin"), updateRentCar)
        .delete(deleteRentedCar)




export default rentCarRouter