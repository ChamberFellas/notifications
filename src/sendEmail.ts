import { Types } from "mongoose";
import dotenv from "dotenv";
import BillModel from './billModel';
import ChoreModel from "./choreModel";
import axios from 'axios';
dotenv.config();
//import { user } from "./users"; // need to replace this with appropriate endpoint

import nodemailer from "nodemailer";

interface Chore {
    _id: Types.ObjectId; // MongoDB ObjectId for unique identification
    userID: Types.ObjectId[]; // Array of user IDs as references to the 'users' collection
    houseID: Types.ObjectId[]; // Array of house IDs as references to the 'house' collection
    description: string; // Optional string with a max length of 50
    deadline: Date; // Deadline for the chore
    dateAssigned: Date; // Optional, defaults to the current date if not provided
    repeatEvery?: number; // Optional, defaults to 0 (minimum value is 0)
    status: 'incomplete' | 'complete'; // Optional, defaults to "incomplete", restricted to these two values
    completionAdded: Date | null; // Optional, represents the date of chore completion
    verifiedCount: number; // Optional, defaults to 0
  }
  
  interface Bill {
    _id: Types.ObjectId;
    Item: string;
    Payee: Types.ObjectId;
    Amount: number;
    Payors: Types.ObjectId[];
    Status: 'Unpaid' | 'Paid' | 'Confirmed';
    Deadline: Date;
    Recurring?: 'Weekly' | 'Biweekly' | 'Monthly' | 'None';
    Flag?: boolean;
  }

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
        //const userDoc = await user.findById(userID).select("email"); // Select only the email field

        // If the user document is found, return the email
        //if (userDoc) {
          //  return userDoc.email; // Assuming email is a string in your schema
        //}

        // If no user is found, return null
        return "13felix.blakemore@gmail.com";
    } catch (error) {
        console.error("Error fetching user email:", error);
        throw error; // Optionally propagate the error
    }
}

export async function sendNotification(chore?: Chore, bill?: Bill){
    try {
        const emails: string[] = []; // Initialize an empty array to store emails
        if (chore){
            for (const id of chore.userID) {
                const stringID = id.toString();
                console.log('http://172.26.53.145:3000/get-email/:' + stringID);
                const response = await axios.get('http://172.26.53.145:3000/get-email/' + stringID); // Retrieve the email for the current user ID
                const email = response.data;
                if (email) {
                    emails.push(email); // Add the email to the array
                }
            }
        } else if (bill){
            for (const id of bill.Payors) {
                const email = await getUserEmailById(id); // Retrieve the email for the current user ID
                if (email) {
                    emails.push(email); // Add the email to the array
                }
            }
        } else{
            throw new Error("No bill and no Chore");
        }
        for (const email of emails) {
            
            if (chore) {
                // Check if chore or bill is provided
                const deadline = new Date(chore.deadline); // Ensure it's a Date object

                // Check if the deadline is a valid date
                if (isNaN(deadline.getTime())) {
                    throw new Error(`Invalid deadline: ${chore.deadline}`);
                }
                const formattedDate = deadline.toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
                const mailOptions = {
                    from: process.env.EMAIL_USER, // Sender's email address
                    to: email, // Recipient's email address
                    subject: "Chore Notification", // Email subject
                    text: `You have been assigned a new chore: ${chore.description}, due on ${formattedDate}. Please check ChamberFellas for details!`, // Email body
                };
        
                const info = await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${email}: ${info.response}`);
            } else if (bill) {
                // Check if chore or bill is provided
                const deadline = new Date(bill.Deadline); // Ensure it's a Date object

                // Check if the deadline is a valid date
                if (isNaN(deadline.getTime())) {
                    throw new Error(`Invalid deadline: ${deadline}`);
                }
                const formattedDate = deadline.toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
                const mailOptions = {
                    from: process.env.EMAIL_USER, // Sender's email address
                    to: email, // Recipient's email address
                    subject: "Bill Notification", // Email subject
                    text: `You have a new bill, ${bill.Item}, due on ${formattedDate}. Please make the payment on time.`, // Email body
                };
        
                const info = await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${email}: ${info.response}`);
            } else {
                throw new Error("You must provide either a chore or a bill to send a notification.");
            }
        }        
    } catch (error) {
        console.error("Error sending notifications:", error);
        throw error; // Optionally rethrow the error
    }
}

const testEmails = ["fm819@bath.ac.uk", "13felix.blakemore@gmail.com"];

const testChore: Chore = {
    _id: new Types.ObjectId(), // Automatically generates a MongoDB ObjectId
    userID: [new Types.ObjectId(), new Types.ObjectId()], // Example array of user IDs
    houseID: [new Types.ObjectId()], // Example array of house IDs
    description: 'Clean the windows', // String description within max length
    deadline: new Date('2025-03-20'), // Set a specific deadline
    dateAssigned: new Date(), // Defaults to the current date
    repeatEvery: 7, // Repeat every 7 days (optional)
    status: 'incomplete', // Status is either "incomplete" or "complete"
    completionAdded: null, // Not yet completed
    verifiedCount: 0 // Initial verified count
  };

const testBill: Bill = {
    _id: new Types.ObjectId(), // Automatically generates a MongoDB ObjectId
    Item: "Milk",
    Payee: new Types.ObjectId,
    Amount: 10,
    Payors: [new Types.ObjectId()],
    Status: 'Unpaid',
    Deadline: new Date('2025-03-25')
  };

//sendNotification(undefined, testBill);
//sendNotification(testChore)


