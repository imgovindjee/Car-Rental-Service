import express from 'express'


import AuthMiddleware from '../../middleware/UserAuth/UserAuthMiddleware.js'
import AuthorizeRole from '../../middleware/UserAuth/UserAdminMiddleware.js'

import { allUsers, forgetPassword, signup, signin, logOut, resetPassword, getUserDetails, updateProfile, getAUser, updateAdminProfile, deleteUser, updateUserPassword } from '../../controllers/User/UserControllers.js'




const userRouter = express.Router()



// ROUTES CONTROLLERS...

// ROUTE-1
// REGISTER A USER
userRouter.post("/signup", signup)


// ROUTE-2
// SIGN-IN A USER
userRouter.post("/signin", signin)


// ROUTE-3
// FORGET A LOGGED-IN PASSWORD
userRouter.post("/password/forget", forgetPassword)


// ROUTE-4
// RESET A LOGGED-IN PASSWORD
userRouter.put("/password/reset/:token", resetPassword)


// ROUTE-5
// LOGOUT A USER
userRouter.get("/logout", logOut)



// ROUTER MIDDLEWARE FOR ACCESS OF THIS REGION
userRouter.use(AuthMiddleware)



// ROUTE-6
// GET A LOGGED-IN USER DETAILS
userRouter.get("/user-details", getUserDetails)


// ROUTE-7
// UPDATE A USER profile
userRouter.put("/update-profile", updateProfile)



// ROUTE-8
// UPDATE A USER password
userRouter.put("/update-password", updateUserPassword)





// ADMIN-PART
// OF USER

// ROUTE-1
// GET ALL USER
userRouter.post("/admin/get-all-users", AuthorizeRole("admin"), allUsers)


// ROUTE-2
// ADMIN WORK OUT
userRouter.route("/admin/:id")
    .post(AuthorizeRole("admin"), getAUser)
    .put(AuthorizeRole("admin"), updateAdminProfile)
    .delete(deleteUser);





export default userRouter