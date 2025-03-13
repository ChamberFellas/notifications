import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import Chore from './choreModel'; 
import mongoose from 'mongoose';
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
  title: string;
  assignedTo: string;
  deadline: Date;
  isComplete: boolean;
};

const choresSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  houseID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'house' }],
  description:{
      type: String,
      required: false,
      maxLength: 50,
  },
  deadline: {
      type: Date,
      required: true
  },
  dateAssigned: {
      type: Date,
      required: false,
      default: new Date()
  },
  repeatEvery: {
      type: Number,
      required: false,
      min: 0,
      default: 0
  },
  status:{
      type: String,
      required: false,
      default: "incomplete",
      lowercase: true,
      enum: ['incomplete', 'complete']
  },
  completionAdded:{
      type: Date,
      required: false
  },
  verifiedCount:{
      type: Number,
      required: false,
      default: 0
  }
});

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
      const chores: Chore[] = await Chore.find() //mongoose
      const notifications = chores.map((chore: { title: string; assignedTo: string; deadline: Date; isComplete: boolean;}) => ({
          choreName: chore.title,
          assignedTo: chore.assignedTo,
          deadline: new Date(chore.deadline),
          isComplete: chore.isComplete
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

router.post('/chores', (req, res) => {
  const { chore: Chore } = req.body;
  // check chore is correct
  // post chore onto database with id
  res.json({ message: 'Hello ${name}!'});
});

router.post('/bills', (req, res) => {
  const { bill: Bill } = req.body;
  // check bill is correct
  // post bill onto database with id
  res.json({ message: 'Hello ${name}!'});
});


export default router;
