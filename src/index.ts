import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";
import axios from "axios";
import cron from 'node-cron';
import Chore from './choreModel';

import * as this_module from './index';

export const app = express();

app.use(express.json());
app.use(router);


if (process.env.NODE_ENV !== "test") {
  if (!process.env.PORT) {
    console.error("PORT is not defined");
    console.log("Setting port to default: 3000");
  }
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

app.get('/mock-chores', (req: Request, res: Response) => {
    const mockChores = [
        { title: 'Wash Dishes', assignedTo: 'Shmeelix', deadline: new Date('2025-02-22T18:00:00Z'), isComplete: false },
        { title: 'Clean kitchen', assignedTo: 'Max', deadline: new Date('2025-02-22T18:00:00Z'), isComplete: true },
        { title: 'Clean toilet', assignedTo: 'Finn', deadline: new Date('2025-02-22T18:00:00Z'), isComplete: true }
    ];
    res.json(mockChores);
});

app.get('/mock-bills', (req: Request, res: Response) => {
  const mockBills = [
      { title: 'Rent', assignedTo: 'Bob', amount: '1500' , deadline: new Date('2025-02-22T18:00:00Z'), isComplete: false},
      { title: 'Gas', assignedTo: 'Bob', amount: '50' , deadline: new Date('2025-02-22T18:00:00Z'), isComplete: true},
      { title: 'Water', assignedTo: 'Bob', amount: '30' , deadline: new Date('2025-02-22T18:00:00Z'), isComplete: true}
  ];
  res.json(mockBills);
});

import { Types } from 'mongoose';

export interface Chore {
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

export type Bill = {
  title: string;
  assignedTo: string;
  amount: number;
  deadline: Date;
  isComplete: boolean;
};

export const fetchChores = async () => {
  try {
      const choresResponse = await axios.get('http://localhost:3000/chores');

      const chores: Chore[] = choresResponse.data;

      return chores
  } catch (error) {
      console.error('Error fetching chores:', error);
  }
};

export const fetchBills = async () => {
  try {
      const billsResponse = await axios.get('http://localhost:3000/bills');

      const bills: Bill[]  = billsResponse.data;

      return bills
  } catch (error) {
      console.error('Error fetching bills:', error);
  }
};


export const pollNotifs = async () => {
    const chores = await this_module.fetchChores();
    const bills = await this_module.fetchBills();

    if (chores && bills){
      const incompleteChores = chores.filter((chore: Chore) => chore.status=='incomplete');
      const incompleteBills = bills.filter((bill: Bill) => !bill.isComplete);

      const currentDateTime: Date = new Date();
      const upcomingChores = incompleteChores.filter((chore: Chore) => {
        console.log('Chore Deadline:', chore.deadline, 'Type:', typeof chore.deadline);
        let deadline: Date;

        if (typeof chore.deadline === "string") {
            deadline = new Date(chore.deadline);
        } else {
            deadline = chore.deadline;
        }
        return (deadline.getTime() - currentDateTime.getTime() < 86400000);})
      console.log("Upcoming Chores:", upcomingChores)
    } else {
      console.error('Error fetching');
    }
};

cron.schedule('* * * * *', () => {
  console.log('Running a task every minute');
  pollNotifs();
});
// Do we want a notification for when someone completes a task?
// Notif when an incomplete task passes its deadline

const testPostChore = async () => {
  const chore = {
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

  try {
      const response = await axios.post('http://localhost:3000/chores', { chore });
      console.log('Response:', response.data);
  } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
  }
};

// Call the test function (you can comment this out later)
testPostChore();

export { Chore }