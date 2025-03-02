import { Router } from "express";
import axios from "axios";

const router = Router();

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

router.get("/status", (_, res) => {
  res.status(200).json({ status: "OK" });
});

router.get('/chores', async (req, res) => {
  try {
      // replace mock-chores with chore database address
      const response = await axios.get('http://localhost:3000/mock-chores');
      const chores = response.data;

      const notifications = chores.map((chore: { title: string; assignedTo: string; deadline: Date; isComplete: boolean;}) => ({
          choreName: chore.title,
          assignedTo: chore.assignedTo,
          deadline: new Date(chore.deadline),
          isComplete: chore.isComplete
      }));

      console.log('Converted Chores:', notifications);

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
      
      console.log('Converted Chores:', notifications);

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
