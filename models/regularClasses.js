const mongoose = require('mongoose');


const regularClassSchema = mongoose.Schema({
  category:String,
  startAge:Number,
  endAge:Number,
  activity:String,
  description:String,
  visible:Boolean,
  valid:Boolean,
  regularClassesDetails:[{ type: mongoose.Schema.Types.ObjectId, ref: 'regularClassesDetails' }],

});

const RegularClass = mongoose.model('regularClasses', regularClassSchema);

module.exports = RegularClass;