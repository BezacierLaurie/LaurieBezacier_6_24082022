// Pour IMPORTER 'express' (Application 'Express')
const express = require('express');

// Pour CREER un 'router Express' (Middleware 'routeur')
const router = express.Router();

// Pour IMPORTER 'users' (Controller 'users')
const usersController = require('../controllers/users');

// Routes 'POST' : Pour ENREGISTRER un 'user' dans MongoDB (BdD)
// L'argument '/api/auth' est le 'endpoint' visé par l'application ('endpoint' = URL / URI (route vers l'API) -> Il est remplacé par seulement un '/' car le router remplace le début du path)
// Fonction ('signup') IMPORTEE et APPLIQUEE à la route 
router.post('/signup', usersController.signup);
// Fonction ('login') IMPORTEE et APPLIQUEE à la route 
router.post('/login', usersController.login);

// Pour EXPORTER le routeur (qui va être IMPORTE dans 'app.js')
module.exports = router;
