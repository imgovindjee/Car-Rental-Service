import nodeMailer from 'nodemailer'


const sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        // service: "gmail",
        secure:false,
        auth: {
            user: "carrentalservice26@gmail.com",
            pass: "zkqs eaeb cnef ekex"
        }
    });


    const mailOptions = {
        from: "carrentalservice26@gmail.com",
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
}

export default sendEmail