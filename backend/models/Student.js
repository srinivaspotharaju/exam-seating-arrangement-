const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    rollNumber: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    roomAssigned: { type: String, required: true },
    seatNumber: { type: Number, required: true }
});

module.exports = mongoose.model('Student', StudentSchema);
