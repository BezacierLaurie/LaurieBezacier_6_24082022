// Pour IMPORTER 'dotenv' (Sécurité BdD)
const dotenv = require('dotenv').config();

// Pour IMPORTER 'mongoose' (BdD 'MongoDB')
const mongoose = require('mongoose');

// Pour IMPORTER le routeur (EXPORTE par 'routes/sauces.js')
const saucesRoutes = require('./routes/sauces');

// Pour IMPORTER le routeur (EXPORTE par 'routes/users.js')
const usersRoutes = require('./routes/users');

// Pour IMPORTER 'express' (Application 'Express')
const express = require('express');

// Pour IMPORTER 'helmet' (Sécurité 'helmet' - c'est un des packages de 'NodeJS' - il aide à sécuriser les en-têtes HTTP retournés par l'application 'Express')
const helmet = require('helmet');

// Pour IMPORTER 'morgan' (Sécurité 'morgan' (logger HTTP) - c'est un middleware au niveau des requêtes HTTP - il sert à enregistrer les données (requêtes ou autres))
const morgan = require('morgan');

// Pour IMPORTER 'express-rate-limit' (Sécurité 'express-rate-limit' - c'est un middleware pour les routes 'Express'- il sert à prévenir des attaques, comme la 'force brute')
const rateLimit = require('express-rate-limit');

// Pour ACCEDER au 'path' (chemin) du server
const path = require('path');

// Pour CREER une application
const app = express();

// Pour UTILISER 'helmet'
app.use(helmet(
    {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "images",
                ],
                imgSrc: ["'self'", "images"],
            },
        },
        // Pour CONTOURNER la protection de 'helmet' (afin de pouvoir utiliser (dans ce site) des images provenant d'autres sites) 
        // (sécurité : 'autorisation exceptionnelle' car API publique -> INTERDIT avec une API privée !)
        crossOriginResourcePolicy: {policy : "cross-origin"}
    }
));

// Pour UTILISER 'morgan' (pour LOGGER les 'req' et 'res')
app.use(morgan('dev'));

// Pour UTILISER 'express-rate-limit'
app.enable("trust proxy");
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // Réinitialisation toutes les 10 minutes
    max: 500, // Limite chaque IP à 500 requêtes par `window` (par 10 minutes) (autant pour les nombreux tests réalisés pendant la soutenance)
    standardHeaders: true,  // Renvoie les informations de limite de débit dans les en-têtes `RateLimit-*` 
    legacyHeaders: false,  // Désactive les en-têtes `X-RateLimit-*` 
});
//  Pour APPLIQUER le middleware de limitation de débit à toutes les demandes
app.use(limiter);

// Connexion entre la BdD et l'API (BdD : 'Piiquante')
mongoose.connect('mongodb+srv:' + process.env.pathMongoDB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Pour INTERCEPTER toutes les requêtes qui contiennent du json et METTRE à disposition ce contenu (ACCEDER au corps de la requête) sur l'objet 'requête' (dans req.body)
app.use(express.json()); // Info : Complète la fonctionnalité du 'body-parser' (cas particulier du body)

// Pour IMPLEMENTER "CORS" (appels sécurisés vers l'application) (pas d'URL précisée pour permettre une application à toutes les routes)
app.use((req, res, next) => {
    // Pour ACCEDER à l'API depuis n'importe quelle origine ('*') 
    // (sécurité : 'autorisation exceptionnelle' car API publique -> INTERDIT avec une API privée !)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Pour AJOUTER les headers mentionnés aux requêtes envoyées vers l'API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // Pour ENVOYER des requêtes avec différentes méthodes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Pour ENREGISTRER les routes (présentes dans 'routes/sauces.js')
app.use('/api/sauces', saucesRoutes);

// Pour ENREGISTRER les routes (présentes dans 'routes/users.js')
app.use('/api/auth', usersRoutes); // 'auth' : racine de tout ce qui est lié à l'authentification

// Pour TRAITER les requêtes qui vont vers la route '/image' en rendant le répertoire 'images' statique (cela permet aux images de s'afficher sur le site)
app.use('/images', express.static(path.join(__dirname, 'images'))); // Cela indique à 'Express' qu'il faut gérer la ressource 'images' de manière statique (un sous-répertoire du répertoire de base, '__dirname') à chaque fois qu'elle reçoit une requête vers la route '/images'

// Pour EXPORTER l'application
module.exports = app;

