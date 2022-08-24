// Pour IMPORTER 'bcrypt' (plug-in 'Crypteur de MdP')
const bcrypt = require('bcrypt');

// Pour IMPORTER 'jsonwebtoken' (plug-in qui permet de CREER des 'tokens' et de les VERIFIER)
const jwt = require('jsonwebtoken');

//Pour IMPORTER le modèle 'User'
const User = require('../models/User');

// Pour ENREGISTRER de nouveaux utilisateurs
exports.signup = (req, res, next) => { // 'signup' : fonction qui permet de CRYPTER le MdP
    // Pour 'HACHER' / CRYPTER le MdP (fonction asynchrone)
    bcrypt.hash(req.body.password, 10) // 'req.body.password' ('data'): MdP présent dans le corps de la requête - '10' ('salt'): nb de fois où l'algorythme de 'hachage' sera exécuté
        // Pour RECUPERER le 'hash' de MdP
        .then(hash => { // 'hach' CREE par 'bcrypt'
            // Pour CREER un nouvel 'user'
            const user = new User({ // Création d'une instance (= exemplaire) du modèle 'User' (modèle de 'mongoose')
                email: req.body.email, // 'req.body.email' ('data'): email présent dans le corps de la requête
                password: hash // 'hach' CREE par 'bcrypt' (celui créé plus haut)
            });
            // Pour ENREGISTRER le nouvel 'user' dans MongoDB (BdD)
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error })); // Erreur
        })
        .catch(error => res.status(500).json({ error })); // Erreur 'server'
};

// Pour CONNECTER des utilisateurs existants
exports.login = (req, res, next) => { // 'login' : fonction qui permet de VERIFIER si un 'user' existe dans la BdD ('MongoDB') et si le MdP entré par le 'user' correspont à ce 'user'
    User.findOne({ email: req.body.email }) // '{}': objet (sélecteur qui va servir de filtre) - 'req.body.email': valeur transmise par le 'user'
        .then(user => { // 'user': valeur récupérée par la requête
            // Pour SAVOIR si le 'user' a été trouvé dans la BdD
            if (user === null) { // Si 'user' pas trouvé
                res.status(401).json({ message: 'Paire identifiant / mot de passe incorrecte' }); // Ce message permet de préserver la confidentialité des 'users' concernant leur information personnelle: 'inscrit' ou 'non-inscrit'
            } else { // Sinon
                bcrypt.compare(req.body.password, user.password) // 'compare' : fonction (de bcrypt) qui permet de VERIFIER si le MdP entré par le 'user' est correct, en le comparant à celui stocké dans la BdD - (MdP entré par le 'user' - MdP stocké dans la BdD)
                    .then(valid => {
                        if (!valid) { // Si MdP incorrect
                            res.status(401).json({ message: 'Paire identifiant / mot de passe incorrecte' }); // Ce message permet de préserver la confidentialité des 'users' concernant leur information personnelle: 'inscrit' ou 'non-inscrit'
                        } else { // Sinon
                            res.status(200).json({ // objet qui contient les infos nécessaires à l'authentification des requêtes émises plutard par le 'user'
                                userId: user._id,
                                token: jwt.sign( // 'sign' : fonction (de 'jsonwebtoken') qui permet 
                                    { userId: user._id }, // données que l'on souhaite encodées à l'intérieur du 'token' (appelées le 'payload')
                                    process.env.secretKey, // clé secrète (pour l'encodage)
                                    { expiresIn: '24h' } // 'expiresIn' : durée de validité du 'token' avant expiration
                                )
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error })); // Erreur 'server': est une erreur d'exécution de requête dans la BdD (différent de l'erreur 404 : 'champ pas trouvé dans la BdD')
            }
        })
        .catch(error => res.status(500).json({ error })); // Erreur 'server'
};