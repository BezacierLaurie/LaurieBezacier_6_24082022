// Pour IMPORTER 'mongoose' (BdD 'MongoDB')
const mongoose = require('mongoose');

// Pour IMPORTER 'mongoose-unique-validator' (plug-in 'Validateur user')
const uniqueValidator = require('mongoose-unique-validator');

// Schéma (de données) de l'objet 'userSchema' (de 'Mongoose')
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, // 'unique' : permet d'éviter que plusieurs utilisateurs s'enregistrent / s'inscrivent avec la même adresse mail (+ installation du plug-in (package) 'mongoose-unique-validator)
    password: { type: String, required: true }
});

// Pour APPLIQUER le validateur (plug-in 'mongoose-unique-validator') au schéma avant d'en faire un modèle
userSchema.plugin(uniqueValidator);

// Pour EXPORTER le schéma ('userSchema') sous forme de modèle 'terminé' 
module.exports = mongoose.model("User", userSchema); // 'model' = fonction de 'mongoose' - ("nom du modèle" + schéma de l'objet)