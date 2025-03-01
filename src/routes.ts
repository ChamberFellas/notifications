import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/status", (_, res) => {
  res.status(200).json({ status: "OK" });
});

router.get('/notifications', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:3000/mock-chores');
      const chores = response.data;

      const notifications = chores.map((chore: { choreName: string; personAssigned: string; }) => ({
          choreName: chore.choreName,
          personAssigned: chore.personAssigned,
          notification: `Chore: ${chore.choreName} is assigned to ${chore.personAssigned}`
      }));

      res.json(notifications);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chore data' });
  }
});

// Route to fetch and send notifications for bills
router.get('/bills', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:3000/mock-bills');
      const bills = response.data;

      const notifications = bills.map((bill: { billName: string; amount: number; dueDate: string; }) => ({
          billName: bill.billName,
          amount: bill.amount,
          dueDate: bill.dueDate,
          notification: `Bill: ${bill.billName} of amount $${bill.amount} is due on ${bill.dueDate}`
      }));

      res.json(notifications);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bill data' });
  }
});

router.post('/greet', (req, res) => {
  const { name } = req.body;
  res.json({ message: 'Hello ${name}!'});
});

export default router;
