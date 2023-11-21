const Mailgen = require("mailgen")
const nodemailer = require("nodemailer");
const ApiError = require("./APIError");



const sendMail = async (options) => {


    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            name: 'LMS e-learning',
            link: 'http://localhost:8000'
            // Optional product logo
            // logo: 'https://mailgen.js/img/logo.png'
        }
    });

    // Generate an HTML email with the provided contents
    const emailBody = mailGenerator.generate(options.mailgenContent);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: process.env.BREVO_SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASS,
        },
    });

    const info = {
        from: '"E-learning LMS👻" <LMS@example.com>', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: emailText, // plain text body
        html: emailBody, // html body
    }

    try {
        await transporter.sendMail(info)
        console.log("email for verification  send successfully")
    } catch (error) {
        // we will not throw an error because if email is not send then user have option of resent email verification
        console.log("something went wrong while sending email in nodemailer", error)
    }


}


const emailVerificationCodeMailgenContent = (username, otp) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to LMS e-learning platoform! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with LMS e-learning platform, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: otp,
                    link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
                }
            },
            outro: 'this code will expire in 5min.'
        }
    }
}

const forgottenPasswordCodeMailgenContent = (username, otp) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to LMS e-learning platoform! Plz\dont forget password again.',
            action: {
                instructions: 'Dont share this otp code with any one :',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: otp,
                    link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
                }
            },
            outro: 'this code will expire in 5min.'
        }
    }
}


const coursePurchasedMailgenContent = (username, courseDetail) => {
    return {

        body: {
            name: username,
            intro: 'Your order has been processed successfully.',
            table: {
                data: [
                    {
                        item: courseDetail.title,
                        description: courseDetail.discription,
                        price: courseDetail.price
                    },

                ],
                columns: {
                    // Optionally, customize the column widths
                    customWidth: {
                        item: '20%',
                        price: '15%'
                    },
                    // Optionally, change column text alignment
                    customAlignment: {
                        price: 'right'
                    }
                }
            },
            action: {
                instructions: 'You can check the status of your Course and more in your dashboard:',
                button: {
                    color: '#3869D4',
                    text: 'Go to Dashboard',
                    link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
                    // we will add student dashboardLink here from react.js
                }
            },
            outro: 'We thank you for your purchase.'
        }

    }
}



module.exports = {
    sendMail,
    emailVerificationCodeMailgenContent,
    forgottenPasswordCodeMailgenContent,
    coursePurchasedMailgenContent
}