const nodemailer = require("nodemailer");

// send email function 
const emailSend = async () => {

    // transporter object
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'christelle.kilback24@ethereal.email',
            pass: 'McU67c7pZWHZPYjD2W',
        },
    });

    let info = await transporter.sendMail({
        from: 'saurabhku463@gmail.com',
        to: 'saurabhku463@gmail.com',
        subject: 'Forgot Password',
        text: 'token',
    });
}

// export function
module.exports = emailSend;