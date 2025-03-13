import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";
import axios from "axios";
import cron from 'node-cron';
import Chore from './choreModel';

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

type Chore = {
  title: string;
  assignedTo: string;
  deadline: Date;
  isComplete: boolean;
};

type Bill = {
  title: string;
  assignedTo: string;
  amount: number;
  deadline: Date;
  isComplete: boolean;
};

const fetchChores = async () => {
  try {
      const choresResponse = await axios.get('http://localhost:3000/chores');

      const chores: Chore[] = choresResponse.data;

      return chores
  } catch (error) {
      console.error('Error fetching chores:', error);
  }
};

const fetchBills = async () => {
  try {
      const billsResponse = await axios.get('http://localhost:3000/bills');

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
      const incompleteChores = chores.filter((chore: Chore) => !chore.isComplete);
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

export { Chore }