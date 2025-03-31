import { Types } from "mongoose";
import BillModel from "./billModel";

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
  
  export interface Bill {
    _id: Types.ObjectId;
    Item: string;
    Payee: Types.ObjectId;
    Amount: number;
    Payors: Types.ObjectId[];
    Status: 'Unpaid' | 'Paid' | 'Confirmed';
    Deadline: Date;
    Recurring?: 'Weekly' | 'Biweekly' | 'Monthly' | 'None';
  }