// import * as nodemailer from "nodemailer"
// import { envConfig } from "./env.config"
// export async function sendMail(user: string, message: string) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         secure: true,
//         host: envConfig.mail.host,
//         port: envConfig.mail.port,
//         auth: {
//             user: envConfig.mail.user,
//             pass: envConfig.mail.password
//         }
//     });

//     const mailOptions = {
//         from: envConfig.mail.user,
//         to: user,
//         subject: "Movie",
//         text: message
//     };

//     const res = await transporter.sendMail(mailOptions);
//     return res
// }


// The website I used to deploy render.com blocks smtp to send emails, so I decided to change sending emails.
export const sendMail = async (recipientEmail, message) => {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: recipientEmail,
            subject: 'Movies web-site',
            html: `<p>${message}</p>`,
        }),
    });

    const data = await response.json();
    console.log('Sent:', data);
};