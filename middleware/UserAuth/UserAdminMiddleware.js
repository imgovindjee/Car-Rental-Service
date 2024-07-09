import ErrorHandler from "../../common/ErrorCode.js";

const AuthorizeRole = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.body.userRole)){
            return next(new ErrorHandler(
                `Role: ${req.body.userRole} isn't allowed to access this Region`,
                403
            )) 
        }

        next();
    }
}

export default AuthorizeRole