const express = require('express');
const router = express.Router();
require('../models/connection');
const Organism = require('../models/organisms');
const User = require('../models/users');



//------------- récupération des organismes pour affichage home ------------

router.get('/allOrganisms', (req, res) => {

  Organism.find().then(data => {
    console.log(data[0])
      res.json({ result: false, data: data });
    
  });
});


//------------------- Affichage d'un unique organisme ---------------------

router.get("/:orgNumber", async (req, res) => {
  try {
    console.log(req.params.orgNumber);

    const data = await Organism.findOne({
      orgNumber: req.params.orgNumber,
    }).populate({
      path: 'regularClasses',
      populate: {
        path: 'regularClassesDetails',
        model: 'regularClassesDetails', 
      },
    });

    if (data) {
      console.log(data);
      res.json({ result: true, organism: data });
    } else {
      res.json({ result: false, error: "Organisme non trouvé" });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res.status(500).json({ result: false, error: "Erreur lors de la récupération des données" });
  }
});

//-------------------- Données pour mise à jour organisme ----------------------

router.post("/organismDisplayForUpdate", async (req, res) => {
  try {
    console.log(req.body.token);

    const user = await User.findOne({
      token: req.body.token,
    });

    if (user) {
      const organism = await Organism.findOne({
        user: user._id,
      })
      .populate({
        path: 'regularClasses',
        populate: {
          path: 'regularClassesDetails',
          model: 'regularClassesDetails'
        },
      });

      if (organism) {
        console.log(organism);
        res.json({ result: true, organism: organism });
      } else {
        console.log('Organisme non trouvé');
        res.json({ result: false, error: 'Organisme non trouvé' });
      }
    } else {
      console.log('Utilisateur non trouvé');
      res.json({ result: false, error: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ result: false, error: '????Erreur lors de la récupération des données' });
  }
})


// -------------------- Mise à jour des cours -------------------------------

router.post("/updateField", async (req, res) => {
  try {

    const { field, value, token } = req.body;

    const user = await User.findOne({
      token: token,
    });

    if (user) {
      const organism = await Organism.findOne({
        user: user._id,
      })
      .populate({
        path: 'regularClasses',
        populate: {
          path: 'regularClassesDetails',
          model: 'regularClassesDetails'
        },
      });

      if (organism) {
        Organism.updateOne({ _id: organism._id }, { [field] : value }).then(() => {
      
        console.log("ok "+organism);
        res.json({ result: true, organism: organism });
        })
      } else {
        console.log('Organisme non trouvé');
        res.json({ result: false, error: 'Organisme non trouvé' });
      }
    } else {
      console.log('Utilisateur non trouvé');
      res.json({ result: false, error: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ result: false, error: '????Erreur lors de la récupération des données' });
  }
})



//------------- Récupération de l'organisme correspondant au login -------------

router.post('/createdOrganism', async (req, res) => {
  try {
    console.log(req.body.token);

    const user = await User.findOne({
      token: req.body.token,
    });

    if (user) {
      const organism = await Organism.findOne({
        user: user._id,
      });

      if (organism) {
        regularClass = organism.regularClasses ? true : false;
        res.json({ result: true, organism: organism.orgName, regularClass:regularClass });
      console.log("resultat regularClass :"+regularClass)
      
      } else {
        console.log('Organisme non trouvé');
        res.json({ result: false, error: 'Organisme non trouvé' });
      }
    } else {
      console.log('Utilisateur non trouvé');
      res.json({ result: false, error: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ result: false, error: 'Erreur lors de la récupération des données' });
  }
});

module.exports = router;