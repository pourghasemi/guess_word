// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDf_kyIZV2lSfDq1upaUUg2HLSe19txcEQ',
  authDomain: 'poker-bf68d.firebaseapp.com',
  projectId: 'poker-bf68d',
  storageBucket: 'poker-bf68d.firebasestorage.app',
  messagingSenderId: '709498813717',
  appId: '1:709498813717:web:1ebd06c6a4d0657dfffd1c',
  measurementId: 'G-20T81SLTL9',
}

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firebaseApp = initializeApp(firebaseConfig)

const auth = getAuth(firebaseApp)
const database = getFirestore(firebaseApp)
export { firebaseApp, auth, database }
