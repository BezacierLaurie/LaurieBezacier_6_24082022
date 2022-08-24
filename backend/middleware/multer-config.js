// Middleware pour ENREGISTRER les images (arrivant dans le front-end) dans le dossier 'images'

// Pour IMPORTER 'multer' (Gestionnaire de fichiers 'Multer')
const multer = require('multer');

// Configuration de 'Multer' (partie que l'on construit : 'morceaux' de 'Multer)

// Création de la constante dictionnaire de type 'MIME' pour résoudre l'extension de fichier appropriée (objet qui permet de traduire les formats)
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// Pour CREER un objet de configuration (pour 'Multer')
const storage = multer.diskStorage({ // 'diskStorage' : fonction (de 'Multer') qui permet d'ENREGISTRER le fichier sur le disque
    destination: (req, file, callback) => { // 'destination' : fonction (de 'Multer') qui permet de lui signaler dans quel dossier enregistrer le fichier
        callback(null, 'images'); // 'null' : Permet de SIGNALER qu'il n'y a pas eu d'erreur (à ce niveau-là) - ' ' : Nom du dossier (dans lequel sera enregistré le fichier)
    },
    // Pour CREER le nom du fichier
    filename: (req, file, callback) => { // 'filename' : fonction (de 'Multer') qui permet de CREER un nouveau nom au fichier (différent de celui d'origine)
        const name = file.originalname.split(' ').join('_'); // 'name' : pour GENERER le nouveau nom du fichier (partie avant l'extension) - 'originalname' : propriété (de 'file') qui est le nom d'origine du fichier - 'split' : fonction qui permet d'ELIMINER les espaces ('SPLITER' autour des espaces) et de CREER un tableau (avec les mots du fichier) - 'join' : fonction qui REMPLACE les espaces par des '_' / Les 2 méthodes combinées permettent de TRANSFORMER le tableau en string  
        // Pour APPLIQUER une extension au fichier
        // Pour CREER l'extension du fichier (qui correspond au 'MIME_TYPES' du fichier envoyé par le front-end)
        const extension = MIME_TYPES[file.mimetype];
        // Pour APPELLER la callback
        callback(null, name + Date.now() + '.' + extension); // 'name + Date.now() + '.' + extension' : Création du 'filename' (Détails du résultat final : la fonction 'filename' indique à 'Multer' d'utiliser le nom d'origine, de remplacer les espaces par des underscores ('name') et d'ajouter un timestamp ('Date.now()') comme nouveau nom de fichier. Elle utilise ensuite la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée (''.'' + 'extension').)
    }
});

// 'Réellement' 'Multer' (avec la configuration créée au-dessus)

// Pour EXPORTER 'multer' (Middleware)
module.exports = multer({ storage: storage}).single('image'); // 'single' : fonction (de 'Multer') qui CAPTURE les fichiers d'un certain type (passé en argument), et les ENREGISTRE au système de fichiers du serveur à l'aide du storage configuré (cela permet d'INDIQUER qu'il s'agit d'un fichier unique (par ex : ici 'image' uniquement))