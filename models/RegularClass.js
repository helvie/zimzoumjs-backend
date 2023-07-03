const mongoose = require('mongoose');

const regularClassSchema = mongoose.Schema({
  availability:Number,
  availabilityDate:Date,
  miniAge:Number,
  maxiAge:Number,
  description:String,
  valid:Boolean,
  visible:Boolean,
  day:String,
  startTime:String,
  endTime:String,
  grade:String,
  animator:String
});

const RegularClass = mongoose.model('regularClasses', regularClassSchema);

module.exports = RegularClass;