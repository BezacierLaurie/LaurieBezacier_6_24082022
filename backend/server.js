// Pour IMPORTER le package http de Node
const http = require('http');
// Pour IMPORTER l'application
const app = require('./app');

// Pour RENVOYER un port valide (qu'il soit fourni sous la forme d'un numéro ou d'une chaîne)
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};

// Pour INDIQUER à l'application 'Express' sur quel port elle va tourner
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Pour RECHERCHER les différentes erreurs et les GERER de manière appropriée (elle est ensuite enregistrée dans le serveur)
const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// Pour PASSER l'application au serveur (en le CREANT) ('app' = fonction qui va recevoir la requête et la réponse et qui va apporter des modifications)
const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

// Pour ECOUTER le serveur (des requêtes envoyées)
server.listen(port);