import mongoose from 'mongoose'

const choreSchema = new mongoose.Schema({
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

const ChoreModel = mongoose.model('Chore', choreSchema);
export default ChoreModel;