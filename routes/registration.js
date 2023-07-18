const express = require('express');
const router = express.Router();

const User = require('../models/users');
require('../models/connection');
const Organism = require('../models/organisms');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const RegularClassDetail = require('../models/regularClassesDetail');
const RegularClass = require('../models/regularClasses');

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Configuration de Multer pour la gestion des fichiers
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de taille maximale en octets (ici, 10 Mo)
  },
});

// Route pour l'enregistrement d'un organisme
router.post('/organismRegistration', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'doc', maxCount: 1 }]), async (req, res) => {
  try {
    // Vérifie si les fichiers photo et doc ont été uploadés
    if (!req.files || !req.files['photo'] || !req.files['doc']) {
      return res.status(400).json({ message: 'Aucun fichier photo ou PDF uploadé' });
    }

    // Chemins locaux des fichiers temporaires
    const photoFilePath = req.files['photo'][0].path;
    const pdfFilePath = req.files['doc'][0].path;

    // Upload de la photo sur Cloudinary de manière asynchrone
    const photoUpload = cloudinary.uploader.upload(photoFilePath);
    // Upload du PDF sur Cloudinary de manière asynchrone
    const pdfUpload = cloudinary.uploader.upload(pdfFilePath, { resource_type: 'raw' });

    // Attendre que les uploads sur Cloudinary soient terminés
    const [photoUploadResult, pdfUploadResult] = await Promise.all([photoUpload, pdfUpload]);

    // Supprime les fichiers temporaires après l'upload
    fs.unlinkSync(photoFilePath);
    fs.unlinkSync(pdfFilePath);

    // Récupère l'URL de la photo sur Cloudinary
    const photoUrl = photoUploadResult.secure_url;
    // Récupère l'URL du PDF sur Cloudinary
    const pdfUrl = pdfUploadResult.secure_url;

    // Recherche de l'utilisateur correspondant au jeton (token) fourni dans la requête
    const user = await User.findOne({ token: req.body.token });
    if (!user) {
      // L'utilisateur n'est pas trouvé, renvoyer une erreur ou une réponse appropriée
      return res.status(404).json({ error: 'User not found' });
    }

    // Récupérer les données JSON depuis le corps de la requête
    const orgData = JSON.parse(req.body.orgData);

    // Créer une nouvelle instance de l'objet Organism avec les données reçues
    const newOrganism = new Organism(orgData);

    // Assigner la clé étrangère de l'utilisateur à l'organisme
    newOrganism.user = user._id;

    // Assigner les URL de la photo et du PDF à l'organisme
    newOrganism.image = photoUrl;
    newOrganism.doc = pdfUrl;

    // Enregistrer l'organisme dans la base de données
    const savedOrganism = await newOrganism.save();

    // Ajouter la clé étrangère de l'organisme à la liste des organismes de l'utilisateur
    user.organisms.push(savedOrganism._id);

    // Enregistrer les modifications de l'utilisateur dans la base de données
    await user.save();

    // Retourner la réponse avec les données de l'organisme nouvellement enregistré
    res.json({ result: savedOrganism.orgName });
  } catch (error) {
    // Gérer les erreurs
    console.error('Une erreur s\'est produite:', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'enregistrement de l\'organisme' });
  }
});

router.post("/activityRegistration", async (req, res) => {
  // Vérifier le token pour authentifier l'utilisateur
  const { token, regularClass, regularClassesDetail } = req.body;

  // console.log(req.body.token)

  try {
    const user = await User.findOne({ token: token });
if (!user) {
  return res.status(404).json({ message: "Utilisateur introuvable" });
}

const organism = await Organism.findOne({ user: user._id }).populate('user');

    if (!organism) {
      // Gérer le cas où l'organisme n'a pas été trouvé
      return res.status(404).json({ message: "Organisme introuvable" });
    }
    console.log(organism)

    // 2. Créer et enregistrer une nouvelle regularClass
    const newRegularClass = new RegularClass(regularClass);
    newRegularClass.save();

    // 3. Récupérer l'ID généré pour la nouvelle regularClass
    const regularClassId = savedRegularClass._id;

    // 4. Pour chaque élément dans le tableau regularClassesDetail, créer et enregistrer un nouvel objet regularclassesdetail
    const savedRegularClassDetails = await Promise.all(
      regularClassesDetail.map(async (detail) => {
        const newRegularClassDetail = new RegularClassDetail(detail);
        const savedRegularClassDetail = await newRegularClassDetail.save();
        return savedRegularClassDetail;
      })
    );

    // 5. Mettre à jour le tableau regularclasses dans l'organisme avec l'ID de la nouvelle regularClass créée
    organism.regularclasses.push(regularClassId);
    await organism.save();

    res.status(200).json({ message: "Regular classes enregistrées avec succès" });
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: "Une erreur s'est produite lors de l'enregistrement des regular classes" });
  }
});


module.exports = router;


//-----------------------------------------------------------------------------------------------

// router.post('/uploadPdf', uploadPDF.single('doc'), (req, res) => {
//     // Vérifie si un fichier a été uploadé
//     if (!req.file) {
//       return res.status(400).json({ message: 'Aucun fichier uploadé' });
//     }
  
//     // Chemin local du fichier temporaire
//     const filePath = req.file.path;
  
//     // Upload du fichier sur Cloudinary
//     cloudinary.uploader.upload(filePath, { resource_type: 'raw' }, (error, result) => {
//       // Supprime le fichier temporaire après l'upload
//       fs.unlinkSync(filePath);
  
//       if (error) {
//         console.error('Erreur lors de l\'upload du fichier sur Cloudinary:', error);
//         return res.status(500).json({ message: 'Erreur lors de l\'upload du fichier' });
//       }
  
//       // Récupère l'URL du fichier PDF sur Cloudinary
//       const pdfUrl = result.secure_url;
//       console.log(pdfUrl)
  
//       // Renvoie l'URL du fichier PDF dans la réponse
//       res.json({ pdfUrl });
//     });
//   });

// //-----------------------------------------------------------------------------------------------

// router.post('/upload', upload.single('photo'), (req, res) => {

//     // Vérifie si un fichier a été uploadé
//     if (!req.file) {
//       return res.status(400).json({ message: 'Aucun fichier uploadé' });
//     }
  
//     // Chemin local du fichier temporaire
//     const filePath = req.file.path;
  
//     // Upload du fichier sur Cloudinary
//     cloudinary.uploader.upload(filePath, (error, result) => {
//       // Supprime le fichier temporaire après l'upload
//       fs.unlinkSync(filePath);
  
//       if (error) {
//         console.error('Erreur lors de l\'upload du fichier sur Cloudinary:', error);
//         return res.status(500).json({ message: 'Erreur lors de l\'upload du fichier' });
//       }
  
//       // Récupère l'URL de l'image sur Cloudinary
//       const imageUrl = result.secure_url;
  
//       // Renvoie l'URL de l'image dans la réponse
//       res.json({ imageUrl });
//     });
//   });

//   //-------------------------------------------------------------------------------------------

//   router.post('/organismRegistration', (req, res) => {
//     // Recherche de l'utilisateur correspondant au jeton (token) fourni dans la requête
//     User.findOne({ token: req.body.token }).then(user => {
//       if (!user) {
//         // L'utilisateur n'est pas trouvé, renvoyer une erreur ou une réponse appropriée
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       // Récupérer les données JSON depuis le corps de la requête
//       console.log(req.body.orgData);
  
//       // Créer une nouvelle instance de l'objet Organism avec les données reçues
//       const newOrganism = new Organism(req.body.orgData);
  
//       // Assigner la clé étrangère de l'utilisateur à l'organisme
//       newOrganism.user = user._id;
  
//       // Enregistrer l'organisme dans la base de données
//       newOrganism.save().then(savedOrganism => {
//         // Ajouter la clé étrangère de l'organisme à la liste des organismes de l'utilisateur
//         user.organisms.push(savedOrganism._id);
  
//         // Enregistrer les modifications de l'utilisateur dans la base de données
//         user.save().then(() => {
//           // Retourner la réponse avec les données de l'organisme nouvellement enregistré
//           res.json({ result: savedOrganism.orgName });
//         }).catch(error => {
//           // Gérer les erreurs lors de l'enregistrement des modifications de l'utilisateur
//           res.status(500).json({ error: 'An error occurred while saving the user' });
//         });
//       }).catch(error => {
//         // Gérer les erreurs lors de l'enregistrement de l'organisme
//         res.status(500).json({ error: 'An error occurred while saving the organism' });
//       });
//     }).catch(error => {
//       // Gérer les erreurs lors de la recherche de l'utilisateur
//       res.status(500).json({ error: 'An error occurred while searching for the user' });
//     });
//   });


// module.exports = router;

  // const storage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, 'uploads/'); // Spécifiez le répertoire de destination pour enregistrer les fichiers uploadés
  //   },
  //   filename: function (req, file, cb) {
  //     cb(null, file.originalname); // Utilisez le nom de fichier d'origine pour enregistrer le fichier
  //   }
  // });
  // const upload = multer({ storage: storage });
  // const uploadPDF = multer({ dest: 'uploads/pdf' });