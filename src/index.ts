import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";
import axios from "axios";
import cron from 'node-cron';
import ChoreModel from './choreModel';
import { sendNotification } from "./sendEmail";
import { Types } from 'mongoose';
import { Bill, Chore } from './interfaces';

export const app = express();

app.use(express.json());
app.use(router);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.IP_ADDRESS || '0.0.0.0';

if (process.env.NODE_ENV !== "test") {
  if (!process.env.PORT) {
    console.error("PORT is not defined");
    console.log("Setting port to default: 3000");
  }

  app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

const fetchChores = async () => {
  try {
      const choresResponse = await axios.get(`http://${HOST}:${PORT}/chores`);

      const chores: Chore[] = choresResponse.data;

      return chores
  } catch (error) {
      console.error('Error fetching chores:', error);
  }
};

const fetchBills = async () => {
  try {
      const billsResponse = await axios.get(`http://${HOST}:${PORT}/bills`);

      const bills: Bill[]  = billsResponse.data;

      return bills
  } catch (error) {
      console.error('Error fetching bills:', error);
  }
};


const pollNotifs = async () => {
    const chores = await fetchChores();
    const bills = await fetchBills();

    if (chores && bills){
      const incompleteChores = chores.filter((chore: Chore) => chore.status=='incomplete');
      const incompleteBills = bills.filter((bill: Bill) => bill.Status=='Unpaid');

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
      if (upcomingChores){
        for (const chore of upcomingChores){
          sendNotification(chore);
        }
      }

      const upcomingBills = incompleteBills.filter((bill: Bill) => {
        console.log('Bill Deadline:', bill.Deadline, 'Type:', typeof bill.Deadline);
        let deadline: Date;

        if (typeof bill.Deadline === "string") {
            deadline = new Date(bill.Deadline);
        } else {
            deadline = bill.Deadline;
        }
        return (deadline.getTime() - currentDateTime.getTime() < 86400000);})
      console.log("Upcoming Bills:", upcomingBills)
      if (upcomingBills){
        for (const bill of upcomingBills){
          sendNotification(undefined, bill);
        }
      }
    } else {
      console.error('Error fetching');
    }
};

cron.schedule('* * * * *', () => {
  console.log('Running a task every minute');
  //pollNotifs();
});
// polls chores that are coming up, but sends a notif every minute.
// Do we want a notification for when someone completes a task
// notif when flagged
// Notif when an incomplete task passes its deadline
// notif when new chore assigned to you: Done
// notif when within a day of deadline

// delete notifs after a month?

const testPostChore = async () => {
  const chore = {
    _id: new Types.ObjectId(),
    userID: [new Types.ObjectId(), new Types.ObjectId()],
    houseID: [new Types.ObjectId()],
    description: 'Clean the windows',
    deadline: new Date('2025-03-29'),
    dateAssigned: new Date(),
    repeatEvery: 7,
    status: 'incomplete',
    completionAdded: null, 
    verifiedCount: 0 
  };

  try {
      const response = await axios.post(`http://${HOST}:${PORT}/chores`, { chore });
      console.log('Response:', response.data);
  } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
  }
};

const testPostBill = async () => {
  const bill = {
    _id: new Types.ObjectId(), 
    Item: 'Rent',
    Payee: new Types.ObjectId(),
    Amount: 100,
    Payors: [new Types.ObjectId()],
    Status: 'Unpaid',
    Deadline: new Date('2025-04-05'),
    Recurring: 'None',
  };

  try {
      const response = await axios.post(`http://${HOST}:${PORT}/bills`, { bill });
      console.log('Response:', response.data);
  } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
  }
};