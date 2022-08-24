// Pour IMPORTER 'mongoose' (BdD 'MongoDB')
const mongoose = require('mongoose');

// Schéma (de données) de l'objet 'sauceSchema' (de 'Mongoose')
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat : { type: Number, required: true },
    likes: { type: Number},
    dislikes: { type: Number},
    usersLiked: { type: ["String <userId>"]},
    usersDisliked: { type: ["String <userId>"]},
});

// Pour EXPORTER le schéma ('sauceSchema') sous forme de modèle 'terminé' 
module.exports = mongoose.model("Sauce", sauceSchema); // 'model' = fonction de 'mongoose' - ("nom du modèle" , schéma de l'objet)