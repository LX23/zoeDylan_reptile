var nodemailer = require('nodemailer');
var smtpTransort = require('nodemailer/node_modules/nodemailer-smtp-transport');

var transporter = {};

function sendMail(options, cb) { 
    transporter = nodemailer.createTransport(smtpTransort({
        host: 'smtp.exmail.qq.com',
        port: 465,
        secure: true,
        auth: {
        	user: options.auth.email,
            pass: options.auth.key
        }
    })); 
    var receiver = options.email;
    console.log("发送邮件给", receiver);
    var mailOptions = {
    	from: options.auth.email,
        to: receiver.join(','),
        subject: options.title,
        html: options.content
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
        if (typeof cb == 'function') {
            cb(error);
        }
    });
}
function setting() { 

}
module.exports = {
    sendMail: sendMail,
    setting: setting
}