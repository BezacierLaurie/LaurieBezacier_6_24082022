// Pour IMPORTER 'Sauce' = 'sauceSchema' (de 'models')
const Sauce = require('../models/Sauce');

// Pour IMPORTER 'fs' ('fs' : 'file system' = 'système de fichiers' - c'est un des packages de 'NodeJS' - il permet de supprimer un fichier du système de fichiers)
const fs = require('fs');

// SAUCES :

// Pour GERER la route 'GET' : On EXPORTE la fonction 'getOneSauce' pour la récupération d'un objet ('sauce'), particulier, présent dans MongoDB (BdD)
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // 'Sauce' = 'sauceSchema' (de 'models') (importée plus haut) - 'findOne' : fonction de la class 'Schema' (de 'mongoose') (nom défini par 'mongoose') -'req.params.id' (paramètre de route dynamique) : permet de RECUPERER l'objet dans MongoDB (BdD)
        .then(resultFindOne => res.status(200).json(resultFindOne)) // Retour d'une promesse (=> 'resultFindOne' : renvoie 'Sauce' dans 'Sauces' présent dans MongoDB (BdD))
        .catch(error => res.status(404).json({ error })); // Error (objet non trouvé)
};

// Pour GERER la route 'GET' : On EXPORTE la fonction 'getAllSauces' pour la récupération de tous les objets ('sauce') présents dans MongoDB (BdD)
exports.getAllSauces = (req, res, next) => {
    // Pour TROUVER / RECUPERER la liste complète des 'Sauces' dans MongoDB (BdD)
    Sauce.find() // 'Sauce' = 'sauceSchema' (de 'models') (importée plus haut) - 'find' : fonction de la class 'Schema' (de 'mongoose') (nom défini par 'mongoose') -
        .then(resultFindAll => res.status(200).json(resultFindAll)) // Retour d'une promesse (=> 'resultFindAll' : renvoie d'un tableau contenant toutes les 'sauces' présentes dans MongoDB (BdD))
        .catch(error => res.status(400).json({ error })); // Error
};

// Pour GERER la route 'POST' : On EXPORTE la fonction 'createSauce' pour la création d'un objet ('Sauce') dans MongoDB (BdD)
exports.createSauce = (req, res, next) => {
    // Pour PARSER l'objet 'requête' (comme l'objet (= valeur de 'clé / valeur') est reçu sous la forme d'une string, car envoyée en 'form-data', elle est PARSEE en objet json pour pouvoir être utilisée)
    const sauceReq = JSON.parse(req.body.sauce); // 'sauce' : sauce dans le body de la requête du 'front-end' (nom défini par 'mongoose')
    // Pour SUPPRIMER (dans l'objet) les champs '_id' (car l'id de l'objet va être généré automatiquement par la BdD (MongoDB)) et '_userId' (qui correspond à la personne qui a créé l'objet) (on utilise désormais le 'userId' qui vient du token d'authentification (pour être sur qu'il soit valide)) (car il ne faut JAMAIS faire confiance aux clients)
    delete sauceReq._id;
    delete sauceReq.user_id;
    // Pour CREER l'objet (avec ce qui a été passé (moins les 2 champs supprimés))
    const sauce = new Sauce({ // 'new Sauce' : création d'une nouvelle instance (= exemplaire) de la class 'Sauce' (= 'sauceSchema') (importée plus haut)
        ...sauceReq, // Déconstruction de l'objet 'sauce', que le front-end a envoyé (6 'clé / valeur' : userId, name, manufacturer, ...)
        userId: req.auth.userId, // 'userId' = extrait de l'objet 'requête' grâce au middleware 'auth'
        // Ou 'res.locals.auth.userId'à la place de "req.auth.userId"
        // Pour GENERER l'URL de l'image (par nous-même, car 'Multer' ne délivre que le nom du fichier, en utilisant des propriétés de l'objet 'requête' : protocole - nom d'hôte - nom du dossier - nom du fichier (délivré par 'Multer'))
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    // Pour ENREGISTRER le nouvel objet 'sauce' dans MongoDB (BdD)
    sauce.save() // 'sauce' : instance de la class 'Sauce' (= 'sauceSchema') (importée plus haut) - 'save' : fonction de la class 'Schema' (de 'mongoose') (nom défini par 'mongoose')
        .then(() => { res.status(201).json({ message: 'Sauce créée !' }) }) // Retour de la promesse
        .catch(error => { res.status(400).json({ error }) }) // Erreur ('Mauvaise' requête)
};

// Pour GERER la route 'PUT' : On EXPORTE la fonction 'modifySauce' pour la modification d'un objet ('sauce') dans MongoDB (BdD)
exports.modifySauce = (req, res, next) => { // 'modifySauce' (choix personnel du nom)
    // 2 cas possibles : l'utilisateur peut transmettre un fichier ou non. Suivant le cas, l'objet sera récupéré d'une manière différente
    // Astuce : Pour SAVOIR si la requête a été faite avec un fichier, il faut regarder s'il y a un champ 'file' dans l'objet 'requête'
    // Pour EXTRAIRE l'objet 'requête' et VERIFIER s'il y a un fichier dans la requête
    const sauceReq = req.file ? // '?' = if
        // Cas 1 : L'utilisateur a transmis un fichier. Pour RECUPERER l'objet 'sauce' (présent dans le body de la requête du 'front-end') : il faut PARSER la chaîne de caractères et RE-CREER l'URL
        {
            ...JSON.parse(req.body.sauce), // 'sauce' : sauce dans le body de la requête du front-end (nom défini par 'mongoose')
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        }
        // Cas 2 : L'utilisateur n'a pas transmis de fichier. Pour RECUPERER l'objet 'sauce' : il faut RECUPERER simplement l'objet 'sauce' directement dans le corps de la requête
        : { ...req.body };

    // Pour SUPPRIMER le 'userId' venant de la requête (pour EVITER qu'un personne crée un objet à son nom, puis le modifie pour le réassigner à une autre personne) (mesure de sécurité)
    delete sauceReq._userId;
    // Pour VERIFIER les droits de l'utilisateur. Procédé : On RECUPERE l'objet 'userId' dans MongoDB (BdD) (pour VERIFIER si c'est bien l'utilisateur à qui appartient cet objet qui cherche à le MODIFIER) (mesure de sécurité)
    Sauce.findOne({ _id: req.params.id }) // 'Sauce' = 'sauceSchema' (de 'models') (importée plus haut) - 'findOne' : fonction de la class 'Schema' (de 'mongoose') (nom défini par 'mongoose') - 'req.params.id' (paramètre de route dynamique) : permet de RECUPERER l'objet dans MongoDB (BdD)
        .then((sauce) => { // 'sauce' (obj) : data (données) du résultat de la requête du front-end (réponse contenue dans la promesse)
            // Soit 'Non-autorisé' (car erreur d'authentification utilisateur)
            if (sauce.userId != req.auth.userId) { // 'userId' (de 'sauce' (data))
                return res.status(401).json({ message: 'Non-autorisé !' }); // Pour STOPPER l'action
                
            }
            // Soit 'Mise à jour de l'enregistrement'
            else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceReq, _id: req.params.id })
                    /*                  - 'Sauce' = 'sauceSchema' (de 'models') (importée plus haut) 
                                        - '{}' : Filtre qui permet de dire quel est l'{enregistrement à mettre à jour} et avec quel {objet} 
                                        => objet de comparaison : 
                                        -> celui que l'on souhaite modifier (parsé) : {'_id' (de 'MongoDB' (BdD)) : 'sauceId' (paramètre de l'URL)}
                                        -> nouvelle version de l'objet : {'...sauceReq' (déconstruction de l'objet 'sauce', que le front-end a envoyé), l'id (dans l'URL)} 
                                        (important : car celui présent dans le corps de la requête ne sera pas forcément le bon)
                     */
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' })) // Retour d'une promesse (=> : renvoie d'une réponse positive)
                    .catch(error => res.status(401).json({ error })); // Error
            }
        })
};

// Pour GERER la route 'DELETE' : On EXPORTE la fonction 'deleteSauce' pour la suppression d'un objet ('sauce') dans MongoDB (BdD)
exports.deleteSauce = (req, res, next) => {
    // Pour VERIFIER les droits de l'utilisateur. Procédé : On RECUPERE l'objet 'userId' dans MongoDB (BdD) (pour VERIFIER si c'est bien l'utilisateur à qui appartient cet objet qui cherche à le SUPPRIMER) (mesure de sécurité)
    Sauce.findOne({ _id: req.params.id }) // 'Sauce' = 'sauceSchema' (de 'models') (importée plus haut) - 'findOne' : fonction de la class 'Schema' (de 'mongoose') (nom défini par 'mongoose') - 'req.params.id' (paramètre de route dynamique) : permet de RECUPERER l'objet dans MongoDB (BdD)
        .then(sauce => { // 'sauce' (obj) : data (données) du résultat de la requête du front-end (réponse contenue dans la promesse)
            // Soit 'Non-autorisé' (car erreur d'authentification utilisateur)
            if (sauce.userId != req.auth.userId) { // 'sauce' (du 'front-end')
                return res.status(401).json({ message: 'Non-autorisé !' });
            }
            // Soit 'Suppression de l'objet dans MongoDB (BdD)' et 'Suppression de l'image du système de fichiers'
            else {
                // Pour RECUPERER l'URL enregistrée et RE-CREER le chemin sur le système de fichiers à partir de celle-ci
                const filename = sauce.imageUrl.split('/images/')[1]; // 'split' : Permet de RECUPERER le nom de fichier (autour du répertoire 'images')
                // Partie 'Suppression de l'image du système de fichiers'
                fs.unlink(`images/${filename}`, () => { // 'unlink' (méthode de 'fs') - '() =>' : Appel de la callback (une fois que la suppression aura eu lieu) (info : la suppression dans le système de fichiers est faite de manière asynchrone)
                    // Partie 'Suppression de l'objet dans MongoDB (BdD)'
                    Sauce.deleteOne({ _id: req.params.id }) // = Objet qui sert de filtre (sélecteur) pour DESIGNER celui que l'on souhaite SUPPRIMER) : {'id' envoyé dans les paramètres de requête}
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' })) // Retour d'une promesse (=> : renvoie d'une réponse positive)
                        .catch(error => res.status(401).json({ error })); // Error
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

// LIKES / DISLIKES :

exports.likeSauce = (req, res, next) => {

    const userId = req.body.userId; // 'userId' dans le BODY de la requête (du 'front-end')
    const likeValue = req.body.like; // 'like' dans le BODY de la requête (du 'front-end') = '1' ou '0' ou '-1'
    const sauceId = req.params.id; // 'id' dans l'URL (params = paramètre de l'URL)

    // Pour TROUVER l'objet 'sauce' dans MongoDB (BdD)
    Sauce.findOne({ _id: sauceId }) // 'Sauce' = 'sauceSchema' (de 'models') (importée plus haut) et sert de passerelle vers la collection 'sauce' dans 'MongoDB' (BdD) - 'findOne' : fonction de la class 'Schema' (de 'mongoose') (nom défini par 'mongoose') - '_id' (créé par 'MongoDB' (BdD)) - 'sauceId' (paramètre de route dynamique) : permet de RECUPERER l'objet dans MongoDB (BdD)
        // Pour RECUPERER l'objet 'sauce' dans MongoDB (BdD)
        .then(sauce => { // 'sauce' (obj) : data (données) du résultat de la requête de 'MongoDB' (BdD) (réponse contenue dans la promesse)
            // Si 'sauce' n'existe pas dans 'MongoDB' (BdD)
            if (!sauce) { // = pas de sauce - 'sauce' (obj) : data (données) du résultat de la requête de MongoDB (BdD) (réponse contenue dans la promesse)
                // alors 'erreur'
                return res.status(401).json({ message: "Cette sauce n'existe pas dans la base de donnée !" });
            }
            // Sinon 'sauce' existe : GERER la valeur du 'like'
            else {
                console.log("La sauce existe !");

                // (partie des valeurs (de 'sauce') que l'on souhaite modifier)
                const newValues = {
                    usersLiked: sauce.usersLiked,
                    usersDisliked: sauce.usersDisliked,
                    likes: 0,
                    dislikes: 0
                }

                // LIKE :

                // Pour SUPPRIMER le 'user' du array 'usersLiked'
                if (newValues.usersLiked.includes(userId)) {
                    const index = newValues.usersLiked.indexOf(userId);
                    newValues.usersLiked.splice(index, 1);
                    console.log("Le 'userId' : '" + userId + "' , a bien été supprimé du array 'usersLiked' !");
                    console.log("Vérif : Nombre de 'userId' dans le array 'usersLiked' : " + newValues.usersLiked.length);
                }

                // Pour INSERER un nouvel 'userId' dans le array 'usersLiked'
                if (likeValue == 1) {
                    newValues.usersLiked.push(userId);
                    console.log("Un nouvel 'userId' (" + userId + ") est inscrit dans le array 'usersLiked' !");
                    console.log("Info : user(s) présent(s) dans le array 'usersLiked' : " + newValues.usersLiked);
                };
                // Pour CONNAITRE le nb de 'like' présents dans le tableau 'usersLiked'
                newValues.likes = newValues.usersLiked.length; // 'likes' (de 'sauceSchema' de 'models')
                console.log("Vérif : Nombre de 'likes' dans le array 'usersLiked' : " + newValues.likes);


                // DISLIKE :

                // Pour SUPPRIMER le 'user' du array 'usersDisLiked' 
                if (newValues.usersDisliked.includes(userId)) {
                    const index = newValues.usersDisliked.indexOf(userId);
                    newValues.usersDisliked.splice(index, 1);
                    console.log("Le 'userId' : '" + userId + "' , a bien été supprimé du array 'usersDisliked' !");
                    console.log("Vérif : Nombre de 'userId' dans le array 'usersDisliked' : " + newValues.usersDisliked.length);
                }

                // Pour INSERER un nouvel 'userId' dans le array 'usersDisLiked'
                if (likeValue == -1) {
                    newValues.usersDisliked.push(userId);
                    console.log("Un nouvel 'userId' (" + userId + ") est inscrit dans le array 'usersDisliked' !");
                    console.log("Info : user(s) présent(s) dans le array 'usersDisliked' : " + newValues.usersDisliked);
                };
                // Pour CONNAITRE le nb de 'dislike' présents dans le tableau 'usersDisliked'
                newValues.dislikes = newValues.usersDisliked.length; // 'dislikes' (de 'sauceSchema' de 'models')
                console.log("Vérif : Nombre de 'likes' dans le array 'usersDisliked' : " + newValues.dislikes);


                // Pour SAUVEGARDER, dans 'MongoDB' (BdD), les modifications apportées à 'Sauce' 
                Sauce.updateOne({ _id: sauceId }, newValues)
                    /*                  - 'Sauce' = 'sauceSchema' (de 'models') (importée plus haut) 
                                        - '{}' : Filtre qui permet de dire quel est l'{enregistrement à mettre à jour} et avec quel {objet} 
                                        => objet de comparaison : 
                                        -> celui que l'on souhaite modifier (parsé) : {'_id' (de 'MongoDB' (BdD)) : 'sauceId' (paramètre de l'URL)}
                                        -> nouvelle version de l'objet : {partie des valeurs (de 'sauce') que l'on souhaite modifier}
                     */
                    .then(() => res.status(200).json({ message: 'Vote enregistré !' })) // Retour d'une promesse (=> : renvoie d'une réponse positive)
                    .catch(error => res.status(401).json({ error })); // Error
            }
        })
        .catch(error => res.status(500).json({ error })); // Error
};