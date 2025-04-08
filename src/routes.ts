import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import choreModel from './choreModel';
import BillModel from './billModel'; 
import mongoose, { Mongoose } from 'mongoose';
import { Types } from 'mongoose';
import { getUserEmailById, sendNotification } from "./sendEmail";
import { Bill, Chore } from "./interfaces"

const router = Router();

const MONGO_URL = process.env.MONGOURL || '';
const MONGO_USERNAME = process.env.MONGOUSERNAME;
const MONGO_PASSWORD = process.env.MONGOPASSWORD;

const FULL_MONGO_URL = `${MONGO_URL}?authSource=admin`;

mongoose.connect(FULL_MONGO_URL, {
  user: MONGO_USERNAME,
  pass: MONGO_PASSWORD,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

router.get("/status", (_, res) => {
  res.status(200).json({ status: "OK" });
});

router.get('/chores', async (req, res) => {
  try {
      const chores: Chore[] = await choreModel.find() //mongoose
      const notifications = chores.map((chore: Chore) => ({
        choreID: chore._id,
        userID: chore.userID,
        houseID: chore.houseID, 
        description: chore.description,
        deadline: chore.deadline, 
        dateAssigned: chore.dateAssigned,
        repeatEvery: chore.repeatEvery,
        status: chore.status,
        completionAdded: chore.completionAdded,
        verifiedCount: chore.verifiedCount
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
      billID: bill._id,
      Item: bill.Item,
      Payee: bill.Payee,
      Amount: bill.Amount,
      Payors: bill.Payors, 
      Status: bill.Status,
      Deadline: new Date(bill.Deadline),
      Recurring: bill.Recurring
    }));
    
    console.log('Bills:', notifications);

    res.json(notifications);
} catch (error) {
    console.error('Error fetching bill data:', error);
    res.status(500).json({ error: 'Failed to fetch bill data' });
}
});

router.post('/chores', async (req, res) => {
  const { chore } = req.body;
  try {
      chore.notificationSent = false;
      // Create a new instance of the Chore model with the data
      const newChore = new choreModel(chore);

      // Save the new chore to the database
      await newChore.save();
      console.log("YIPPEE");

      await sendNotification("new", chore);
      chore.notificationSent = true;
      res.status(201).json(newChore);
  } catch (error) {
      console.error('Failed to save chore', error);
  }
});

router.post('/bills', async (req, res) => {
  const { bill } = req.body;
  console.log(bill)
  try {
      // Create a new instance of the Chore model with the data
      const newBill = new BillModel(bill);

      // Save the new chore to the database
      await newBill.save();
      await sendNotification("new", undefined, bill);
      res.status(201).json(newBill);
  } catch (error) {
      // Handle any errors during the save operation
      console.error('Failed to save bill', error);
  }
});

export default router;
