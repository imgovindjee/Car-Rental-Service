export const cookieOption = {
    expires: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: true
}


const sendToken = (user, statusCode, res) => {

    // getting this token from the schema while saving the data
    const token = user.getJWTToken();

    return res.status(statusCode)
        .cookie("token", token, cookieOption)
        .json({
            success: true,
            user_info: user,
            token,
        })
}

export default sendToken