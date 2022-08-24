// Pour IMPORTER 'Sauce' (modèle)
const Sauce = require('../models/Sauce');

// Pour IMPORTER 'fs' ('fs' : 'file system' = 'système de fichiers' - c'est un des packages de 'Node' - il permet de supprimer un fichier du système de fichiers)
const fs = require('fs');

// Pour GERER la route 'GET' : On EXPORTE la fonction 'getOneSauce' pour la récupération d'un objet ('sauce'), particulier, présent dans MongoDB (BdD)
exports.getOneSauce = (req, res, next) => { 
    Sauce.findOne({ _id: req.params.id }) // 'Sauce' (de 'models') - ':id' = partie dynamique (de la route) (= 'req.params.id' : paramètre de route dynamique)
        .then(resultFindOne => res.status(200).json(resultFindOne)) // Retour d'une promesse (=> 'resultFindOne' : renvoie 'Sauce' dans 'Sauces' présent dans MongoDB (BdD))
        .catch(error => res.status(404).json({ error })); // Error (objet non trouvé)
};

// Pour GERER la route 'GET' : On EXPORTE la fonction 'getAllSauces' pour la récupération de tous les objets ('sauce') présents dans MongoDB (BdD)
exports.getAllSauces = (req, res, next) => {
    // Pour TROUVER / RECUPERER la liste complète des 'Sauces' dans MongoDB (BdD)
    Sauce.find() // 'Sauce' (de 'models')
        .then(resultFindAll => res.status(200).json(resultFindAll)) // Retour d'une promesse (=> 'resultFindAll' : renvoie d'un tableau contenant toutes les 'sauces' présentes dans MongoDB (BdD))
        .catch(error => res.status(400).json({ error })); // Error
};

// Pour GERER la route 'POST' : On EXPORTE la fonction 'createSauce' pour la création d'un objet ('Sauce') dans MongoDB (BdD)
exports.createSauce = (req, res, next) => {
    // Pour PARSER l'objet 'requête' (comme l'objet (= valeur de 'clé / valeur') est reçu sous la forme d'une string, car envoyée en 'form-data', elle est PARSEE en objet json pour pouvoir être utilisée)
    const sauceObject = JSON.parse(req.body.sauce);
    // Pour SUPPRIMER (dans l'objet) les champs '_id' (car l'id de l'objet va être généré automatiquement par la BdD (MongoDB)) et '_userId' (qui correspond à la personne qui a créé l'objet) (on utilise désormais le 'userId' qui vient du token d'authentification (pour être sur qu'il soit valide)) (car il ne faut JAMAIS faire confiance aux clients)
    delete sauceObject._id;
    delete sauceObject.user_id;
    // Pour CREER l'objet (avec ce qui a été passé (moins les 2 champs supprimés))
    const sauce = new Sauce({ // Création d'une instance (= exemplaire) du modèle 'Sauce' (modèle de 'mongoose')
        ...sauceObject, // Déconstruction de l'objet (userId, name, manufacturer, ...)
        userId: req.auth.userId, // 'userId' = extrait de l'objet 'requête' grâce au middleware 'auth'
        // Ou 'res.locals.auth.userId'à la place de "req.auth.userId"
        // Pour GENERER l'URL de l'image (par nous-même, car 'Multer' ne délivre que le nom du fichier, en utilisant des propriétés de l'objet 'requête' : protocole - nom d'hôte - nom du dossier - nom du fichier (délivré par 'Multer'))
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    });
    // Pour ENREGISTRER le nouvel objet 'sauce' dans la BdD ('MongoDB')
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) }) // Retour de la promesse
        .catch(error => { res.status(400).json({ error }) }) // Erreur ('Mauvaise' requête)
};

// Pour GERER la route 'PUT' : On EXPORTE la fonction 'modifySauce' pour la modification d'un objet ('sauce') dans MongoDB (BdD)
exports.modifySauce = (req, res, next) => { 
    // 2 cas possibles : l'utilisateur peut transmettre un fichier ou non. Suivant le cas, l'objet sera récupéré d'une manière différente
    // Astuce : Pour SAVOIR si la requête a été faite avec un fichier, il faut regarder s'il y a un champ 'file' dans l'objet 'requête'
    // Pour EXTRAIRE l'objet 'requête' et VERIFIER s'il y a un fichier dans la requête
    const sauceObject = req.file ?
        // Cas 1 : L'utilisateur a transmis un fichier. Pour RECUPERER l'objet : il faut PARSER la chaîne de caractères et RE-CREER l'URL
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        }
        // Cas 2 : L'utilisateur n'a pas transmis de fichier. Pour RECUPERER l'objet : il faut RECUPERER simplement l'objet directement dans le corps de la requête
        : { ...req.body };

    // Pour SUPPRIMER le 'userId' venant de la requête (pour EVITER qu'un personne crée un objet à son nom, puis le modifie pour le réassigner à une autre personne) (mesure de sécurité)
    delete sauceObject._userId;
    // Pour VERIFIER les droits de l'utilisateur. Procédé : On RECUPERE l'objet 'userId' dans la BdD ('MongoDB') (pour VERIFIER si c'est bien l'utilisateur à qui appartient cet objet qui cherche à le MODIFIER) (mesure de sécurité)
    Sauce.findOne({ _id: req.params.id }) // 'Sauce' (de 'models') - ':id' = partie dynamique (de la route) (= 'req.params.id' : paramètre de route dynamique)
        .then((sauce) => { // 'sauce' : data de 'Sauce'
            // Soit 'Non-autorisé' (car erreur d'authentification utilisateur)
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé !' });
            }
            // Soit 'Mise à jour de l'enregistrement'
            else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) // = (Filtre qui permet de dire quel est l'{enregistrement à mettre à jour} et avec quel {objet}) => objet de comparaison : (celui que l'on souhaite modifier (parsé)) : {'id' envoyé dans les paramètres de requête}, nouvelle version de l'objet : {la 'sauce' qui est dans le corps de la requête, l'id (pris dans la route) correspondant à celui des paramètres (important : car celui présent dans le corps de la requête ne sera pas forcément le bon)}
                 
                .then(() => res.status(200).json({ message: 'Objet modifié !' })) // Retour d'une promesse (=> : renvoie d'une réponse positive)
                    .catch(error => res.status(401).json({ error })); // Error
            }
        })
};

// Pour GERER la route 'DELETE' : On EXPORTE la fonction 'deleteSauce' pour la suppression d'un objet ('sauce') dans MongoDB (BdD)
exports.deleteSauce = (req, res, next) => {
    // Pour VERIFIER les droits de l'utilisateur. Procédé : On RECUPERE l'objet 'userId' dans la BdD ('MongoDB') (pour VERIFIER si c'est bien l'utilisateur à qui appartient cet objet qui cherche à le SUPPRIMER) (mesure de sécurité)
    Sauce.findOne({ _id: req.params.id }) // 'Sauce' (de 'models') - ':id' = partie dynamique (de la route) (= 'req.params.id' : paramètre de route dynamique)
        .then(sauce => { // 'sauce' : data de 'Sauce'
            // Soit 'Non-autorisé' (car erreur d'authentification utilisateur)
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé !' });
            }
            // Soit 'Suppression de l'objet dans la BdD ('MongoDB')' et 'Suppression de l'image du système de fichiers'
            else {
                // Pour RECUPERER l'URL enregistrée et RE-CREER le chemin sur le système de fichiers à partir de celle-ci
                const filename = sauce.imageUrl.split('/images/')[1]; // 'split' : Permet de RECUPERER le nom de fichier (autour du répertoire 'images')
                // Partie 'Suppression de l'image du système de fichiers'
                fs.unlink(`images/${filename}`, () => { // 'unlink' (méthode de 'fs') - '() =>' : Appel de la callback (une fois que la suppression aura eu lieu) (info : la suppression dans le système de fichiers est faite de manière asynchrone)
                    // Partie 'Suppression de l'objet dans la BdD ('MongoDB')'
                    Sauce.deleteOne({ _id: req.params.id }) // = Objet qui sert de filtre (sélecteur) pour DESIGNER celui que l'on souhaite SUPPRIMER) : {'id' envoyé dans les paramètres de requête}
                        .then(() => res.status(200).json({ message: 'Objet supprimé !' })) // Retour d'une promesse (=> : renvoie d'une réponse positive)
                        .catch(error => res.status(401).json({ error })); // Error
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};