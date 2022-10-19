// Pour IMPORTER 'express' (Application 'Express')
const express = require('express');

// Pour CREER un 'router Express' (Middleware 'routeur')
const router = express.Router();

// Pour IMPORTER 'auth' (Middleware 'authentification')
const auth = require('../middleware/auth');

// Pour IMPORTER 'multer' (Middleware 'enregistreur de fichiers')
const multer = require('../middleware/multer-config');

// Pour IMPORTER 'sauces' (Controller 'sauces') 
const saucesController = require('../controllers/sauces'); // 'saucesController' : Permet la gestion de la route

// Infos (générales) :
// - L'argument '/api/sauces' est le 'endpoint' visé par l'application ('endpoint' = URL / URI (route vers l'API) -> Il est remplacé par seulement un '/' car le router remplace le début du path)
// - REMPLACER 'use' par 'un verbe HTTP' (pour CIBLER les différents types de requêtes)

// SAUCES :

// Route 'GET' : Pour TROUVER / RECUPERER la liste complète des 'sauces' dans 'MongoDB' (BdD)
// Fonction ('getAllSauces') : méthode du controller, qui est IMPORTEE et APPLIQUEE à la route 
router.get('/', auth, saucesController.getAllSauces);

// Route 'GET' : Pour RECUPERER une 'sauce' individuelle dans MongoDB (BdD)
// Fonction ('getOneSauce') : méthode du controller, qui est IMPORTEE et APPLIQUEE à la route 
router.get('/:id', auth, saucesController.getOneSauce); // (':id' : valeur variable)

// Route 'POST' : Pour ENREGISTRER une 'sauce' dans MongoDB (BdD)
// Fonction ('createSauce') : méthode du controller, qui est IMPORTEE et APPLIQUEE à la route 
router.post('/', auth, multer, saucesController.createSauce);

// Route 'PUT' : Pour MODIFIER une 'sauce' dans MongoDB (BdD)
// Fonction ('modifySauce') : méthode du controller, qui est IMPORTEE et APPLIQUEE à la route 
router.put('/:id', auth, multer, saucesController.modifySauce); // (':id' : valeur variable)

// Route 'DELETE' : Pour supprimer une 'sauce' dans MongoDB (BdD)
// Fonction ('deleteSauce') : méthode du controller, qui est IMPORTEE et APPLIQUEE à la route 
router.delete('/:id', auth, saucesController.deleteSauce); // (':id' : valeur variable)

// LIKES / DISLIKES :

// Route 'POST' : Pour ENREGISTRER un 'like' (ou un 'dislike') dans MongoDB (BdD) (info : Méthode 'POST' utilisée car l'action que l'on souhaite réaliser est l'ajout d'un '1' dans 'like' (ou 'dislike') : '+1 like' (ou '+1 dislike'))
// Fonction ('likeSauce') : méthode du controller, qui est IMPORTEE et APPLIQUEE à la route 
router.post('/:id/like', auth, saucesController.likeSauce); // (':id' : valeur variable)


// Pour EXPORTER le routeur
module.exports = router;