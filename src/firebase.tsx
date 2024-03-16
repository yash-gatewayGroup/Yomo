import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { initializeApp } from "firebase/app";
import 'firebase/compat/storage'
import 'firebase/compat/database'
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
};

firebase.initializeApp(firebaseConfig);

const app = initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = getAuth();
const newTimestamp = firebase.firestore.Timestamp.now();
const analytics = getAnalytics();

export { db, storage, auth, app, newTimestamp, analytics }
