import nodemailer from 'nodemailer';
import createMail from './createMail.js';

const transporter=nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
        user:process.env.USER,
        pass:process.env.PASSWORD,
    },
});
export default async function sendMail(req,res){
    try{
        const {username,useremail,subject,mailType,otp}=req.body;
        const fromAdress=`shk<${process.env.EMAIL}`;
        const mailHtml=createMail(mailType,{username,otp});
        const email={
            from:fromAdress,
            to:useremail,
            subject:subject,
            html:mailHtml,
        };
        transporter.send(email).
        then(()=>res.status(200).send({msg:'email sent successfully'}))
        .catch((err)=>res.status(500).send({error:'email not sent',err}));
    }catch(err){
        res.status(401).send(err);
    }
}