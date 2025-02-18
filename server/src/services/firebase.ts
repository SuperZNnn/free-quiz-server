import admin from 'firebase-admin'

if (!admin.apps.length){
    admin.initializeApp({
        credential: admin.credential.cert(require('../config/firebase.json'))
    })
}
else{
    admin.app()
}

export const verifyIdToken = async (idToken: string) => {
    try{
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        return decodedToken
    }
    catch (error){
        throw new Error('Token inválido ou expirado')
    }
}