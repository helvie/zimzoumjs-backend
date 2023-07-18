

const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    longitude: Number,
    latitude: Number,
    route: String,
    route2: String,
    postalCode: String,
    city: String
});

const organismSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users' 
  },
  orgNumber:String,
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
  visible:Boolean,
  
  rgpd:Boolean,
  valid:Boolean,
  createDate: Date,
  updateDate: Date,
  sentMail:Number,
  orgMain:Boolean,

  regularClasses:[{ type: mongoose.Schema.Types.ObjectId, ref: 'regularClasses' }],
});

const Organism = mongoose.model('organisms', organismSchema);

module.exports = Organism;