import mongoose from 'mongoose'

const billSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Item:{
        type: String,
        required: true,
    },
    Payee: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    Amount: {
        type: Number,
        required: true
    }, 
    Payors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    Status: {
        type: String, 
        enum: ['Unpaid', 'Paid', 'Confirmed'],
        required: true
    }, 
    Deadline: {
        type: Date,
        required: true
    },
    Recurring: {
        type: String,
        enum: ['Weekly', 'Biweekly', 'Monthly', 'None'], 
        required: false
    },
  });

const BillModel = mongoose.model('Bill', billSchema);
export default BillModel;