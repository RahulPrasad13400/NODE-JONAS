// 136th video. Sending email with nodemailer 

const nodemailer = require("nodemailer")

const sendEmail = async options => {

    // 1) Create a transporter

    // HOW TO SEND EMAIL USING GMAIL 
    // const transporter = nodemailer.createTransport({
    //     service : 'Gmail',
    //     auht : {
    //         user : // ENTER EMAIL USERNAME ,
    //         pass : // EMAIL_PASSWORD 
    //     }
    //     // Activate in gmail "less secure app" option
    // })

    const transporter = nodemailer.createTransport({
        host : process.env.EMAIL_HOST,
        port : process.env.EMAIL_PORT,
        auth : {
            user : process.env.EMAIL_USERNAME,
            pass : process.env.EMAIL_PASSWORD
        }
    })

    
    // 2) Define the Email Options
    const mailOptions = {
        from : 'Jonas Schmedtmann <hello@jonas.io>',
        to : options.email,
        subject : options.subject,
        text : options.text 
    }

    console.log( await transporter.sendMail(mailOptions))
    // 3) Actually send the Email 
    await transporter.sendMail(mailOptions)
    console.log("i work here 2")
}

module.exports = sendEmail