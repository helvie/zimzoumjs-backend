const mongoose = require('mongoose');



const regularClassDetailSchema = mongoose.Schema({
  availability:String,
  availabilityDate:Date,
  startAge:Number,
  endAge:Number,
  day:String,
  startTime:String,
  endTime:String,
  grade:String,
  animator:String
});

const RegularClassDetail = mongoose.model('regularClassesDetails', regularClassDetailSchema);

module.exports = RegularClassDetail;