import { Types } from "mongoose";
import dotenv from "dotenv";
import BillModel from './billModel';
import ChoreModel from "./choreModel";
dotenv.config();
//import { user } from "./users"; // need to replace this with appropriate endpoint

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail", // Use "gmail" or another provider like "outlook"
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
});


export async function getUserEmailById(userID: Types.ObjectId): Promise<string | null> {
    try {
        // Query the database for the user by ID
        const userDoc = await user.findById(userID).select("email"); // Select only the email field

        // If the user document is found, return the email
        if (userDoc) {
            return userDoc.email; // Assuming email is a string in your schema
        }

        // If no user is found, return null
        return null;
    } catch (error) {
        console.error("Error fetching user email:", error);
        throw error; // Optionally propagate the error
    }
}

export async function sendNotification(emails: string[]){
    try {
        for (const email of emails) {
            const mailOptions = {
                from: process.env.EMAIL_USER, // Sender's email address
                to: email, // Recipient's email address
                subject: "Chore Notification", // Email subject
                text: "You have been assigned a new chore. Please check your dashboard for details!", // Email body
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${email}: ${info.response}`);}
    } catch (error) {
        console.error("Error sending notifications:", error);
        throw error; // Optionally rethrow the error
    }
}

const testEmails = ["fm819@bath.ac.uk", "13felix.blakemore@gmail.com"];
sendNotification(testEmails)


