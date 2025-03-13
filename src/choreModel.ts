import mongoose from 'mongoose'

// Define a schema and model (example for a 'User' collection)
const choreSchema = new mongoose.Schema({
    title: String,
    assignedTo: String,
    deadline: Date,
    isComplete: Boolean
  });

const Chore = mongoose.model('Chore', choreSchema);
export default Chore;
  