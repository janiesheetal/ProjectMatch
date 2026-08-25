import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

function loadEnv() {
  const text = readFileSync(new URL('../.env', import.meta.url), 'utf-8')
  const env = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

const env = loadEnv()
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})
const auth = getAuth(app)
const db = getFirestore(app)

await createUserWithEmailAndPassword(auth, `patch-${Date.now()}@example.com`, 'TestPass123!')

await setDoc(doc(db, 'users', 'seed-user-6'), { isDayScholar: true }, { merge: true })
await setDoc(doc(db, 'users', 'seed-user-8'), { isDayScholar: true }, { merge: true })
console.log('Patched seed-user-6 and seed-user-8 with isDayScholar: true')

await deleteUser(auth.currentUser)
