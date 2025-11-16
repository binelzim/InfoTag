import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCrryjfWZkWsAjzx8diayCWdxiL5JygG0I",
  authDomain: "tag-sos.firebaseapp.com",
  projectId: "tag-sos",
  storageBucket: "tag-sos.firebasestorage.app",
  messagingSenderId: "72152733918",
  appId: "1:72152733918:web:d2c67ceafd3a25fd1e8a4f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default firebaseConfig;
