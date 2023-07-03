const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

  email: {
    type: String,
    required: true,
    //unique: true
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  organisms: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'organisms' 
  }]

})

const User = mongoose.model('users', userSchema);

module.exports = User;