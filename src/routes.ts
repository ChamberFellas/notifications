import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import choreModel from './choreModel';
import BillModel from './billModel'; 
import mongoose, { Mongoose } from 'mongoose';
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



router.get("/status", (_, res) => {
  res.status(200).json({ status: "OK" });
});

router.get('/chores', async (req, res) => {
  try {
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
        choreID: chore._id, 
        userID: chore.userID,
        houseID: chore.houseID,
        description: chore.description || '', 
        deadline: new Date(chore.deadline), 
        dateAssigned: chore.dateAssigned || new Date(), 
        repeatEvery: chore.repeatEvery || 0, 
        status: chore.status || 'incomplete',
        completionAdded: chore.completionAdded || null, 
        verifiedCount: chore.verifiedCount || 0,
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
    // replace mock-chores with chore database address
    const bills: Bill[] = await BillModel.find() //mongoose
    const notifications = bills.map((bill: Bill) => ({
      billID: bill._id, // Mapping _id to choreID for clarity in notifications
      Item: bill.Item,
      Payee: bill.Payee, // User IDs associated with the chore
      Amount: bill.Amount,
      Payors: bill.Payors, // House IDs related to the chore
      Status: bill.Status, // Default to empty if not provided
      Deadline: new Date(bill.Deadline), // Ensuring Date format
      Recurring: bill.Recurring, // Default to current date
      Flag: bill.Flag, // Default to 0
    }));
    
    console.log('Bills:', notifications);

    res.json(notifications);
} catch (error) {
    console.error('Error fetching bill data:', error);
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

    // Filter out any null values (in case some users don't exist)
    await sendNotification(chore);
      // Send a response back to the client with the saved chore
      res.status(201).json(newChore);
      // send email notif of Chore
      // how do i get the users email? query the user database with the user id and get the email.
  } catch (error) {
      // Handle any errors during the save operation
      res.status(500).json({ error: 'Failed to save chore'});
  }
});

router.post('/bills', async (req, res) => {
  const { bill } = req.body; // Retrieve the chore object from the request body

  try {
      // Create a new instance of the Chore model with the data
      const newBill = new BillModel(bill);

      // Save the new chore to the database
      await newBill.save();
      await sendNotification(undefined, bill);
      res.status(201).json(newBill);
      // send email notif of Chore
      // how do i get the users email? query the user database with the user id and get the email.
  } catch (error) {
      // Handle any errors during the save operation
      res.status(500).json({ error: 'Failed to save chore'});
  }
});

export default router;
