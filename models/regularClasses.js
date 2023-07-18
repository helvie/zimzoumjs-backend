const mongoose = require('mongoose');


const regularClassSchema = mongoose.Schema({
  category:String,
  startAge:Number,
  endAge:Number,
  activity:String,
  description:String,
  visible:Boolean,
  valid:Boolean,
  // regularClassesDetail:[{ type: mongoose.Schema.Types.ObjectId, ref: 'regularClassDetail' }],

});

const RegularClass = mongoose.model('regularClasses', regularClassSchema);

module.exports = RegularClass;