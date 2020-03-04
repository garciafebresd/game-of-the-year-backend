import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';


const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://game-of-the-year-88c0f.firebaseio.com"
});

const database = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//     response.json({
//         message: "Hello desde funciones Firebase!"
//     });
// });
//
// export const getGOTY = functions.https.onRequest( async (request, response) => {
//     // const nombre = request.query.nombre || 'Sin nombre';
//     // response.json({nombre});
//     const gotyRef = database.collection('goty');
//     const docsSnap = await gotyRef.get();
//     const games = docsSnap.docs.map(doc => doc.data());

//     response.json(games);
// });


//EXPRESS
const app = express();
app.use(cors({ origin: true }));

//GET
app.get('/goty', async (request, response) => {
    const gotyRef = database.collection('goty');
    const docsSnap = await gotyRef.get();
    const games = docsSnap.docs.map(doc => doc.data());

    response.json(games);
});

//POST
app.post('/goty/:id', async (request, response) => {

    const id = request.params.id;
    const gameRef = database.collection('goty').doc(id);
    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {
        response.status(404).json({
            ok: false,
            message: 'No existe un juego con el id => ' + id
        });
    }

    const currentGameData = gameSnap.data() || { votos: 0 };
    await gameRef.update({
        votos: currentGameData.votos + 1
    });

    response.json({
        ok: true,
        message: `Gracias por tu voto a ${currentGameData.name}`
    });
});


// exports.api = functions.https.onRequest(app);
export const api = functions.https.onRequest(app);
