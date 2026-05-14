import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDkp7uEhxxCOJuuWjfmGtQo3CGtyD3DebA",
  authDomain: "loerd04-9b8e4.firebaseapp.com",
  databaseURL: "https://loerd04-9b8e4-default-rtdb.firebaseio.com",
  projectId: "loerd04-9b8e4",
  storageBucket: "loerd04-9b8e4.firebasestorage.app",
  messagingSenderId: "475348767797",
  appId: "1:475348767797:web:3aee1ac0a37b923ab78d7c",
  measurementId: "G-M2TBF7PSZL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithEmail(email: string, pass: string) {
  return signInWithEmailAndPassword(auth, email, pass);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function registerWithEmail(email: string, pass: string, name: string) {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(res.user, { displayName: name });
  return res.user;
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
