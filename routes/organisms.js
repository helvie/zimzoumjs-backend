const express = require('express');
const router = express.Router();
require('../models/connection');
const Organism = require('../models/organisms');

router.get('/allOrganisms', (req, res) => {

  Organism.find().then(data => {
    console.log(data[0])
      res.json({ result: false, data: data });
    
  });
});

router.get("/:orgNumber", (req, res) => {
  console.log(req.params.orgNumber)
  Organism.findOne({
    orgNumber: req.params.orgNumber,
  }).then(data => {
    if (data) {
      console.log(data)
      res.json({ result: true, organism: data });
    } else {
      res.json({ result: false, error: "organisme non trouvé" });
    }
  });
});

module.exports = router;