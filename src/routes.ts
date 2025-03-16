import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import choreModel from './choreModel'; 
import mongoose from 'mongoose';
import { Types } from 'mongoose';
import { getUserEmailById, sendNotification } from "./sendEmail";
const router = Router();

const MONGO_URL = process.env.MONGOURL || ''; // Fallback to default if MONGOURL is undefined
const MONGO_USERNAME = process.env.MONGOUSERNAME;
const MONGO_PASSWORD = process.env.MONGOPASSWORD;

const FULL_MONGO_URL = `${MONGO_URL}?authSource=admin`; // Add `authSource=admin` if you're using the "admin" database for authentication

mongoose.connect(FULL_MONGO_URL, {
  user: MONGO_USERNAME,        // Set the username
  pass: MONGO_PASSWORD,        // Set the password
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

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
  

type Bill = {
  title: string;
  assignedTo: string;
  amount: number;
  deadline: Date;
  isComplete: boolean;
};

router.get("/status", (_, res) => {
  res.status(200).json({ status: "OK" });
});

router.get('/chores', async (req, res) => {
  try {
      // replace mock-chores with chore database address
      const chores: Chore[] = await choreModel.find() //mongoose
      const notifications = chores.map((chore :{
        _id: mongoose.Types.ObjectId,
        userID: mongoose.Types.ObjectId[],
        houseID: mongoose.Types.ObjectId[],
        description: string,
        deadline: Date,
        dateAssigned: Date,
        repeatEvery?: number,
        status: 'incomplete' | 'complete';
      completionAdded: Date | null;
      verifiedCount: number;

      }) => ({
        choreID: chore._id, // Mapping _id to choreID for clarity in notifications
        userID: chore.userID, // User IDs associated with the chore
        houseID: chore.houseID, // House IDs related to the chore
        description: chore.description || '', // Default to empty if not provided
        deadline: new Date(chore.deadline), // Ensuring Date format
        dateAssigned: chore.dateAssigned || new Date(), // Default to current date
        repeatEvery: chore.repeatEvery || 0, // Default to 0 if not provided
        status: chore.status || 'incomplete', // Default to "incomplete"
        completionAdded: chore.completionAdded || null, // Null if not provided
        verifiedCount: chore.verifiedCount || 0, // Default to 0
      }));
      
      console.log('Chores:', notifications);

      res.json(notifications);
  } catch (error) {
      console.error('Error fetching chore data:', error);
      res.status(500).json({ error: 'Failed to fetch chore data' });
  }
});

// Route to fetch and send notifications for bills
router.get('/bills', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:3000/mock-bills');
      const bills = response.data;

      const notifications = bills.map((bill: { title: string; assignedTo: string; amount: number; deadline: Date; isComplete: boolean; }) => ({
          billName: bill.title,
          assignedTo: bill.assignedTo,
          amount: bill.amount,
          deadline: new Date(bill.deadline),
          isComplete: bill.isComplete
      }));
      
      console.log('Bills:', notifications);

      res.json(notifications);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bill data' });
  }
});

router.post('/chores', async (req, res) => {
  const { chore } = req.body; // Retrieve the chore object from the request body

  try {
      // Create a new instance of the Chore model with the data
      const newChore = new choreModel(chore);

      // Save the new chore to the database
      await newChore.save();
      const emails = await Promise.all(
        newChore.userID.map(async (userID) => await getUserEmailById(userID))
    );

    // Filter out any null values (in case some users don't exist)
    const validEmails = emails.filter((email): email is string => email !== null);
    await sendNotification(validEmails);
      // Send a response back to the client with the saved chore
      res.status(201).json(newChore);
      // send email notif of Chore
      // how do i get the users email? query the user database with the user id and get the email.
  } catch (error) {
      // Handle any errors during the save operation
      res.status(500).json({ error: 'Failed to save chore'});
  }
});

router.post('/bills', (req, res) => {
  const { bill: Bill } = req.body;
  // check bill is correct
  // post bill onto database with id
  // send email notif
  res.json({ message: 'Hello ${name}!'});
});


export default router;
