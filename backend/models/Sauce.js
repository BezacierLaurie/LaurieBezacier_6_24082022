// Pour IMPORTER 'mongoose' (Bibliothèque de 'MongoDB')
const mongoose = require('mongoose');

// Schéma (de données) de l'objet 'sauceSchema' (de 'mongoose')
const sauceSchema = mongoose.Schema({ // 'sauceSchema' = variable qui contient la class 'Schema' de 'mongoose'
    // SAUCES :
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat : { type: Number, required: true },

    // LIKES / DISLIKES :
    likes: { type: Number}, // = représente la longeur du tableau 'usersLiked' (et non pas le '+1')
    dislikes: { type: Number}, // = représente la longeur du tableau 'usersDisliked' (et non pas le '-1')
    usersLiked: { type: ["String <userId>"]},
    usersDisliked: { type: ["String <userId>"]},
});

// Pour EXPORTER le schéma ('sauceSchema') sous forme de modèle 'terminé' 
module.exports = mongoose.model("Sauce", sauceSchema); // 'model' = fonction de 'mongoose' - ("nom du modèle" , schéma de l'objet) : 'Sauce' (màj car il représente la class 'sauceSchema') = 'sauceSchema' (nouveau nom de 'Sauce')