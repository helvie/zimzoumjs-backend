const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Regularclass = require('../models/regularclasses');
const Regularclassdetail = require('../models/regularclassesdetails');
require('../models/connection');
const Organism = require('../models/organisms');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier'); // Importez streamifier
const multer = require('multer');
const path = require('path');



// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration de Multer pour le stockage des fichiers
const storage = multer.memoryStorage(); // Stockage en mémoire
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Limite de taille maximale en octets (ici, 50 Mo)
  },
});

router.post('/organismRegistration', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'doc', maxCount: 1 }]), async (req, res) => {
  const photoFile = req.files.photo[0];
  const docFile = req.files.doc[0];

  try {
    const docResult = await new Promise((resolve, reject) => {
      const docStream = streamifier.createReadStream(docFile.buffer);
      docStream.pipe(
        cloudinary.uploader.upload_stream({ folder: "demo" }, (error, result) => {
          if (error) {
            console.error(error);
            return reject(error);
          }
          resolve(result.secure_url);
        })
      );
    });

    const photoResult = await new Promise((resolve, reject) => {
      const photoStream = streamifier.createReadStream(photoFile.buffer);
      photoStream.pipe(
        cloudinary.uploader.upload_stream({ folder: "demo" }, (error, result) => {
          if (error) {
            console.error(error);
            return reject(error);
          }
          resolve(result.secure_url);
        })
      );
    });

    const data = JSON.parse(req.body.dataToSend);
    const user = await User.findOne({ token: data.token });

    const newOrganism = new Organism({
      respCivility: data.respCivility,
      respName: data.respName,
      respNameDisplay: data.respNameDisplay,
      phonePrivate: data.phonePrivate,
      emailPrivate: data.emailPrivate,
      organismSort: data.organismSort,
      orgName: data.orgName,
      location: {
        longitude: data.longitude,
        latitude: data.latitude,
        route: data.route,
        postalCode: data.postalCode,
        city: data.city,
      },
      emailPublic: data.emailPublic,
      phonePublic: data.phonePublic,
      website: data.website,
      image: photoResult,
      doc: docResult,
      description: data.description,
      orgVisible: true,
      regularclasses: [],
      orgNumber: 1,
      user: user,
      respRole: data.respRole
    });

    
    const lastOrganism = await Organism.findOne({}, {}, { sort: { orgNumber: -1 } });
    if (lastOrganism) {
      newOrganism.orgNumber = lastOrganism.orgNumber + 1;
    } else {
      // Aucun organisme trouvé dans la base de données, initialisation orgNumber à 1
      newOrganism.orgNumber = 1;
    }

    // Enregistrer l'organisme dans la base de données
    const savedOrganism = await newOrganism.save();

    // Retourner la réponse avec les données de l'organisme nouvellement enregistré
    res.json({ success: true, result: savedOrganism.orgName });
  } catch (error) {
    console.error('Une erreur s\'est produite:', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'enregistrement de l\'organisme' });
  }
});

//oooooooooooooooooooooooo Enregistrement de l'image ooooooooooooooooooooooooooo

router.post('/imageRegistration', upload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
//   console.log(req.files)
console.log("etape 1")
  try {
  const photoFile = req.files.image[0];
  
  const photoResult = await new Promise((resolve, reject) => {
    const photoStream = streamifier.createReadStream(photoFile.buffer);
    photoStream.pipe(
      cloudinary.uploader.upload_stream({ folder: "demo" }, (error, result) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        resolve(result.secure_url);
      })
    );
  });
  console.log("etape 2")


//       return res.status(400).json({ message: 'Aucun fichier photo uploadé' });
//     }

//     // Chemin local du fichier temporaire
//     const photoFilePath = req.files['image'][0].path;

//     // Upload de la photo sur Cloudinary de manière asynchrone
//     const photoUpload = cloudinary.uploader.upload(photoFilePath);

//     // Attendre que les uploads sur Cloudinary soient terminés
//     const [photoUploadResult] = await Promise.all([photoUpload]);

//     // Supprime le fichier temporaire après l'upload
//     fs.unlinkSync(photoFilePath);

//     // Récupère l'URL de la photo sur Cloudinary
//     const photoUrl = photoUploadResult.secure_url;

//     // Recherche de l'utilisateur correspondant au jeton (token) fourni dans la requête
    const user = await User.findOne({ token: req.body.token });
    console.log("etape 3")

    if (!user) {
      return res.status(404).json({ error: 'User not found' });

    }

    const organism = await Organism.findOne({ user: user._id });
    console.log("etape 4")

    if (organism) {

      // Met à jour l'URL de l'image de l'organisme
      await Organism.updateOne({ _id: organism._id }, { image: photoResult });
      // console.log("photo url : " + photoResult)

      res.json({ result: true, photoUrl: photoResult });
    } else {

      console.log('Organisme non trouvé');
      res.json({ result: false, error: 'Organisme non trouvé' });
    }
  } catch (error) {
    // Gérer les erreurs
    console.error('Une erreur s\'est produite:', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'enregistrement de l\'organisme' });
  }
});

//oooooooooooooooooooooooooo Enregistrement du pdf ooooooooooooooooooooooooooooo

// router.post('/docRegistration', upload.fields([{ name: 'doc', maxCount: 1 }]), async (req, res) => {
//   console.log(req.files)
//   try {

//     // Vérifie si les fichiers photo ont été uploadés
//     if (!req.files || !req.files['doc']) {

//       return res.status(400).json({ message: 'Aucun fichier photo uploadé' });
//     }

//     // Chemin local du fichier temporaire
//     const docFilePath = req.files['doc'][0].path;

//     // Upload de la photo sur Cloudinary de manière asynchrone
//     const docUpload = cloudinary.uploader.upload(docFilePath);

//     // Attendre que les uploads sur Cloudinary soient terminés
//     const [docUploadResult] = await Promise.all([docUpload]);

//     // Supprime le fichier temporaire après l'upload
//     fs.unlinkSync(docFilePath);

//     // Récupère l'URL de la photo sur Cloudinary
//     const docUrl = docUploadResult.secure_url;

//     // Recherche de l'utilisateur correspondant au jeton (token) fourni dans la requête
//     const user = await User.findOne({ token: req.body.token });

//     if (!user) {

//       return res.status(404).json({ error: 'User not found' });

//     }

//     const organism = await Organism.findOne({ user: user._id });

//     if (organism) {

//       // Met à jour l'URL de l'image de l'organisme
//       await Organism.updateOne({ _id: organism._id }, { doc: docUrl });
//       console.log(docUrl)

//       // Renvoie une réponse avec le nom de l'organisme mis à jour
//       res.json({ result: true, docUrl: docUrl });
//     } else {

//       console.log('Organisme non trouvé');
//       res.json({ result: false, error: 'Organisme non trouvé' });
//     }
//   } catch (error) {
//     console.error('Une erreur s\'est produite:', error);
//     res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'enregistrement de l\'organisme' });
//   }
// });

router.post('/docRegistration', upload.single('doc'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier document uploadé' });
    }

    // Chemin local du fichier temporaire
    const docFilePath = req.file.path;

    // Upload du document sur Cloudinary de manière asynchrone
    const docUploadResult = await cloudinary.uploader.upload(docFilePath, { folder: "demo" });

    // Supprime le fichier temporaire après l'upload
    fs.unlinkSync(docFilePath);

    // Récupère l'URL du document sur Cloudinary
    const docUrl = docUploadResult.secure_url;

    // Recherche de l'utilisateur correspondant au jeton (token) fourni dans la requête
    const user = await User.findOne({ token: req.body.token });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const organism = await Organism.findOne({ user: user._id });

    if (organism) {
      // Met à jour l'URL du document de l'organisme
      await Organism.updateOne({ _id: organism._id }, { doc: docUrl });
      // console.log(docUrl);

      res.json({ result: true, docUrl: docUrl });
    } else {
      console.log('Organisme non trouvé');
      res.json({ result: false, error: 'Organisme non trouvé' });
    }
  } catch (error) {
    console.error('Une erreur s\'est produite:', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'enregistrement du document' });
  }
});

//ooooooooooooooooooooo Enregistrement de l'activité oooooooooooooooooooooooo

router.post("/activityRegistration", async (req, res) => {
  console.log("essai")

  const { token, regularclass, regularclassesdetails } = req.body.dataActivity;
  console.log("essai1")
  try {
    const user = await User.findOne({ token: token });
    console.log("essai2")

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
      console.log("essai3")

    }

    const organism = await Organism.findOne({ user: user._id }).populate('user');
    console.log("essai4")

    if (!organism) {
      return res.status(404).json({ message: "Organisme introuvable" });
    }

    const newRegularclass = new Regularclass(regularclass);
    // console.log("new regular class : "+newRegularclass)

    const savedRegularclass = await newRegularclass.save();
    console.log("essai5")

    const savedRegularclassesdetails = await Promise.all(

      regularclassesdetails.map(async (detail) => {
        const newRegularclassdetail = new Regularclassdetail(detail.data);
        newRegularclassdetail.startTime = `${detail.data.startHours}:${detail.data.startMinutes}`;
        const savedRegularclassdetail = await newRegularclassdetail.save();
        return savedRegularclassdetail._id;
      })
    );
    console.log("essai6")


    savedRegularclass.regularclassesdetails = savedRegularclassesdetails;
    console.log("essai7")

    // Enregistrez la RegularClass une seule fois
    await savedRegularclass.save();
    console.log("essai8")

    // Ajoutez l'ID de la RegularClass à l'organisme
    organism.regularclasses.push(savedRegularclass._id);
    await organism.save();
    console.log("essai9")

    res.status(200).json({ message: "Regular classes enregistrées avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Une erreur s'est produite lors de l'enregistrement des regular classes" });
  }
});


//oooooooooooooooooooooooo Mise à jour de l'activité ooooooooooooooooooooooooooo


router.put("/updateActivity", async (req, res) => {
  const { token, activityData, detailData } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });

    }

    const organism = await Organism.findOne({ user: user._id }).populate('user');

    if (!organism) {

      return res.status(404).json({ message: "Organisme introuvable" });
    }

    const existingActivity = await Regularclass.findById(activityData._id);

    if (!existingActivity) {

      return res.status(404).json({ message: "Activité introuvable" });
    }

    // Mettez à jour les propriétés de l'activité
    existingActivity.category = activityData.category;
    existingActivity.activity = activityData.activity;
    existingActivity.startAge = activityData.startAge;
    existingActivity.endAge = activityData.endAge;
    existingActivity.description = activityData.description;
    existingActivity.visible = activityData.visible;

    // Sauvegardez l'activité mise à jour
    await existingActivity.save();

    // Récupérez les ID des détails de la base de données
    const existingDetailIds = existingActivity.regularclassesdetails.map(detail => detail.toString());
    // // Récupérez les ID des détails du tableau B

    const updatedDetailIds = detailData.map(detail => detail.data._id ? detail.data._id : null);

    // // Recherchez les détails à supprimer de la base de données (ceux qui sont dans A mais pas dans B)
    const detailsToDelete = existingDetailIds.filter(id => !updatedDetailIds.includes(id));

    // // Supprimez les détails de la base de données
    for (const detailId of detailsToDelete) {

      await Regularclassdetail.findByIdAndRemove(detailId);

      existingActivity.regularclassesdetails = existingActivity.regularclassesdetails.filter(
        (detail) => detail.toString() !== detailId
      );
    }

    // // mise à jour ou ajout des créneaux
    for (const updatedDetail of detailData) {

      const existingDetail = await Regularclassdetail.findById(updatedDetail.data._id);

      if (!existingDetail) {
        const newDetail = new Regularclassdetail(updatedDetail.data);
        const savedDetail = await newDetail.save();

        //     // Ajoutez l'ID du nouveau détail à l'activité
        existingActivity.regularclassesdetails.push(savedDetail._id);
      } else {
        //     // Mettez à jour les propriétés du détail existant
        existingDetail.availability = updatedDetail.data.availability;
        existingDetail.detailStartAge = updatedDetail.data.detailStartAge;
        existingDetail.detailEndAge = updatedDetail.data.detailEndAge;
        existingDetail.startHours = updatedDetail.data.startHours;
        existingDetail.endHours = updatedDetail.data.endHours;
        existingDetail.startMinutes = updatedDetail.data.startMinutes;
        existingDetail.endMinutes = updatedDetail.data.endMinutes;
        existingDetail.day = updatedDetail.data.day;
        existingDetail.animator = updatedDetail.data.animator;


        await existingDetail.save();
      }
    }

    await existingActivity.save();

    const activity = await Regularclass.findById(activityData._id)
      .populate("regularclassesdetails");

    res.status(200).json({ result: "Activité mise à jour avec succès", updatedActivity: activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la mise à jour de l'activité" });
  }
});


module.exports = router;

// Vérifie si les fichiers photo et doc ont été uploadés
//     if (!req.files || !req.files['photo'] || !req.files['doc']) {
//       return res.status(400).json({ message: 'Aucun fichier photo ou PDF uploadé' });
//     }

//     // Chemins locaux des fichiers temporaires
//     const photoFilePath = req.files['photo'][0].path;
//     const pdfFilePath = req.files['doc'][0].path;

//     // Upload de la photo sur Cloudinary de manière asynchrone
//     const photoUpload = cloudinary.uploader.upload(photoFilePath);
//     // Upload du PDF sur Cloudinary de manière asynchrone
//     const pdfUpload = cloudinary.uploader.upload(pdfFilePath, { resource_type: 'raw' });

//     // Attendre que les uploads sur Cloudinary soient terminés
//     const [photoUploadResult, pdfUploadResult] = await Promise.all([photoUpload, pdfUpload]);

//     // Supprime les fichiers temporaires après l'upload
//     fs.unlinkSync(photoFilePath);
//     fs.unlinkSync(pdfFilePath);

//     // Récupère l'URL de la photo sur Cloudinary
//     const photoUrl = photoUploadResult.secure_url;
//     // Récupère l'URL du PDF sur Cloudinary
//     const pdfUrl = pdfUploadResult.secure_url;

//     // Recherche de l'utilisateur correspondant au jeton (token) fourni dans la requête
//     const user = await User.findOne({ token: req.body.token });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const lastOrganism = await Organism.findOne({}, {}, { sort: { orgNumber: -1 } });

//     // Récupérer les données JSON depuis le corps de la requête
//     const orgData = JSON.parse(req.body.orgData);

//     // Créer une nouvelle instance de l'objet Organism avec les données reçues
//     const newOrganism = new Organism(orgData);

// // Vérifier si lastOrganism est null
// if (lastOrganism) {
//   newOrganism.orgNumber = lastOrganism.orgNumber + 1;
// } else {
//   // Aucun organisme trouvé dans la base de données, initialisation orgNumber à 1
//   newOrganism.orgNumber = 1;
// }

//     // Assigner la clé étrangère de l'utilisateur à l'organisme
//     newOrganism.user = user._id;

//     // Assigner les URL de la photo et du PDF à l'organisme
//     newOrganism.image = photoUrl;
//     newOrganism.doc = pdfUrl;

//ooooooooooooooooooooo Enregistrement de l'organisme oooooooooooooooooooooooooo


// router.post('/organismRegistration', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'doc', maxCount: 1 }]), async (req, res) => {
//   console.log(req.files)
//   try {
//     // Vérifie si les fichiers photo et doc ont été uploadés
//     if (!req.files || !req.files['photo'] || !req.files['doc']) {
//       return res.status(400).json({ message: 'Aucun fichier photo ou PDF uploadé' });
//     }

//     // Chemins locaux des fichiers temporaires
//     const photoFilePath = req.files['photo'][0].path;
//     const pdfFilePath = req.files['doc'][0].path;

//     // Upload de la photo sur Cloudinary de manière asynchrone
//     const photoUpload = cloudinary.uploader.upload(photoFilePath);
//     // Upload du PDF sur Cloudinary de manière asynchrone
//     const pdfUpload = cloudinary.uploader.upload(pdfFilePath, { resource_type: 'raw' });

//     // Attendre que les uploads sur Cloudinary soient terminés
//     const [photoUploadResult, pdfUploadResult] = await Promise.all([photoUpload, pdfUpload]);

//     // Supprime les fichiers temporaires après l'upload
//     fs.unlinkSync(photoFilePath);
//     fs.unlinkSync(pdfFilePath);

//     // Récupère l'URL de la photo sur Cloudinary
//     const photoUrl = photoUploadResult.secure_url;
//     // Récupère l'URL du PDF sur Cloudinary
//     const pdfUrl = pdfUploadResult.secure_url;

//     // Recherche de l'utilisateur correspondant au jeton (token) fourni dans la requête
//     const user = await User.findOne({ token: req.body.token });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const lastOrganism = await Organism.findOne({}, {}, { sort: { orgNumber: -1 } });

//     // Récupérer les données JSON depuis le corps de la requête
//     const orgData = JSON.parse(req.body.orgData);

//     // Créer une nouvelle instance de l'objet Organism avec les données reçues
//     const newOrganism = new Organism(orgData);

// // Vérifier si lastOrganism est null
// if (lastOrganism) {
//   newOrganism.orgNumber = lastOrganism.orgNumber + 1;
// } else {
//   // Aucun organisme trouvé dans la base de données, initialisation orgNumber à 1
//   newOrganism.orgNumber = 1;
// }

//     // Assigner la clé étrangère de l'utilisateur à l'organisme
//     newOrganism.user = user._id;

//     // Assigner les URL de la photo et du PDF à l'organisme
//     newOrganism.image = photoUrl;
//     newOrganism.doc = pdfUrl;

//     // Enregistrer l'organisme dans la base de données
//     const savedOrganism = await newOrganism.save();

//     // Retourner la réponse avec les données de l'organisme nouvellement enregistré
//     res.json({ result: savedOrganism.orgName });
//   } catch (error) {
//     console.error('Une erreur s\'est produite:', error);
//     res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'enregistrement de l\'organisme' });
//   }
// });

// const fs = require('fs');