const errorMiddleware = (err, req, res, next)=>{
    err.message ||= "Internal Server Error"
    err.statusCode ||= 500;

    if (err.name === "CastError") {
        err.statusCode = 400
        err.message = `Invalid Path Format ${err.path}`
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
}

export default errorMiddleware