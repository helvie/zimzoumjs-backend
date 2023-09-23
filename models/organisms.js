const mongoose = require('mongoose');

//////////////////////////////////////////////////////////////////////////////

const locationSchema = mongoose.Schema({
    longitude: Number,
    latitude: Number,
    route: String,
    route2: String,
    postalCode: String,
    city: String
});


//////////////////////////////////////////////////////////////////////////////

const organismSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users' 
  },
  orgNumber:Number,
  respRole:String,
  respCivility:String,
  respName:String,
  respNameDisplay:Boolean,
  phonePrivate:String,
  emailPrivate:String,

  organismSort:String,
  orgName:String,
  location:locationSchema,
  emailPublic:String,
  phonePublic:String,
  website:String,
  doc:String,
  image:String,
  description:String,
  orgVisible:Boolean,
  
  rgpd:Boolean,
  valid:Boolean,
  createDate: Date,
  updateDate: Date,
  sentMail:Number,
  orgMain:Boolean,

  regularclasses:[{ type: mongoose.Schema.Types.ObjectId, ref: 'regularclasses' }],
});

const Organism = mongoose.model('organisms', organismSchema);

module.exports = Organism;