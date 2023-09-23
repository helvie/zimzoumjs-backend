const mongoose = require('mongoose');



const regularclassdetailSchema = mongoose.Schema({
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

const Regularclassdetail = mongoose.model('regularclassesdetails', regularclassdetailSchema);

module.exports = Regularclassdetail;