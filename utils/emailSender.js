const nodemailer = require("nodemailer");

//node miler send mails
const sendmails = async (objectEmail) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // message from argument
    let message = {
        from: process.env.SENDER_MAIL,
        to: objectEmail.toemail,
        subject: objectEmail.subject,
        text: objectEmail.message,
    }

    // send mail with defined transport object
    await transporter.sendMail(message);

};

module.exports = sendmails;