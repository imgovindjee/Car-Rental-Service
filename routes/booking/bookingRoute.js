import express from 'express'


import AuthMiddleware from '../../middleware/UserAuth/UserAuthMiddleware.js'
import AuthorizeRole from '../../middleware/UserAuth/UserAdminMiddleware.js'



import { deleteBooking, getABookings, getAllBookings, getMyBooking, newBooking } from '../../controllers/Booking/BookingControllers.js'






// ROUTER CREATION
const bookingRoute = express.Router()




// ROUTES

// ROUTE-1
// NEW BOOKING
bookingRoute.post("/new", newBooking)



// ROUTE-2
// GEt A BOOKING
bookingRoute.get("/get-a-booking/:id", AuthMiddleware, getABookings)



// ROUTE-3
// GET MY BOOKING's
bookingRoute.post("/get-my-booking", getMyBooking)





// ADMIN PART

// ROUTE-1
// GET ALL BOOKINGS
bookingRoute.post("/admin/get-all-bookings", AuthorizeRole("admin"), getAllBookings)



// ROUTE-2
// DELETE BOOKING
bookingRoute.delete("/admin/delete-booking/:id", deleteBooking)





export default bookingRoute