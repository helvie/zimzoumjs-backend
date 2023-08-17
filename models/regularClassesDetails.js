const mongoose = require('mongoose');



const regularClassDetailSchema = mongoose.Schema({
  availability:String,
  availabilityDate:Date,
  detailStartAge:Number,
  detailEndAge:Number,
  day:String,
  startHours:Number,  
  startMinutes:Number,
  endMinutes:Number,
  endHours:Number,
  grade:String,
  animator:String
});

const RegularClassDetail = mongoose.model('regularClassesDetails', regularClassDetailSchema);

module.exports = RegularClassDetail;