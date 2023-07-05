var express = require('express');
var router = express.Router();

require('../models/connection');
const Organism = require('../models/organisms');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


//cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Spécifiez le répertoire de destination pour enregistrer les fichiers uploadés
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Utilisez le nom de fichier d'origine pour enregistrer le fichier
    }
  });
  const upload = multer({ storage: storage });
  const uploadPDF = multer({ dest: 'uploads/pdf' });

//-----------------------------------------------------------------------------------------------

router.post('/uploadPdf', uploadPDF.single('doc'), (req, res) => {
    // Vérifie si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }
  
    // Chemin local du fichier temporaire
    const filePath = req.file.path;
  
    // Upload du fichier sur Cloudinary
    cloudinary.uploader.upload(filePath, { resource_type: 'raw' }, (error, result) => {
      // Supprime le fichier temporaire après l'upload
      fs.unlinkSync(filePath);
  
      if (error) {
        console.error('Erreur lors de l\'upload du fichier sur Cloudinary:', error);
        return res.status(500).json({ message: 'Erreur lors de l\'upload du fichier' });
      }
  
      // Récupère l'URL du fichier PDF sur Cloudinary
      const pdfUrl = result.secure_url;
      console.log(pdfUrl)
  
      // Renvoie l'URL du fichier PDF dans la réponse
      res.json({ pdfUrl });
    });
  });

//-----------------------------------------------------------------------------------------------

router.post('/upload', upload.single('photo'), (req, res) => {

    // Vérifie si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }
  
    // Chemin local du fichier temporaire
    const filePath = req.file.path;
  
    // Upload du fichier sur Cloudinary
    cloudinary.uploader.upload(filePath, (error, result) => {
      // Supprime le fichier temporaire après l'upload
      fs.unlinkSync(filePath);
  
      if (error) {
        console.error('Erreur lors de l\'upload du fichier sur Cloudinary:', error);
        return res.status(500).json({ message: 'Erreur lors de l\'upload du fichier' });
      }
  
      // Récupère l'URL de l'image sur Cloudinary
      const imageUrl = result.secure_url;
  
      // Renvoie l'URL de l'image dans la réponse
      res.json({ imageUrl });
    });
  });

  //-------------------------------------------------------------------------------------------

  router.post('/organismRegistration', (req, res) => {
    // Récupérer les données JSON depuis le corps de la requête
    console.log(req.body.orgData)  

    const newOrganism = new Organism(req.body.orgData);

      newOrganism.save().then(newOrganism => {
        res.json({ result: req.body.orgData.orgName });
      });


  });


module.exports = router;

