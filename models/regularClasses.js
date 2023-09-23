const mongoose = require('mongoose');

const regularclassSchema = mongoose.Schema({
  category:String,
  startAge:Number,
  endAge:Number,
  activity:String,
  description:String,
  visible:Boolean,
  valid:Boolean,
  regularclassesdetails:[{ type: mongoose.Schema.Types.ObjectId, ref: 'regularclassesdetails' }],

});

const Regularclass = mongoose.model('regularclasses', regularclassSchema);

module.exports = Regularclass;