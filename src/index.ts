import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";

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
        { choreName: 'Wash Dishes', personAssigned: 'Shmeelix' },
        { choreName: 'Clean kitchen', personAssigned: 'Max' },
        { choreName: 'Clean toilet', personAssigned: 'Finn' }
    ];
    res.json(mockChores);
});

app.get('/mock-bills', (req: Request, res: Response) => {
  const mockBills = [
      { billName: 'Rent', amount: '1500' , dueDate: '10'},
      { billName: 'Gas', amount: '50' , dueDate: '10'},
      { billName: 'Water', amount: '30' , dueDate: '10'}
  ];
  res.json(mockBills);
});

