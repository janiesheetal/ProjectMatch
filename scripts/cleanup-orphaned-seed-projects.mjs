import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'
import { seedProjects } from '../src/lib/seedData.js'

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

// Writes require an authenticated user under these rules; use a throwaway
// account purely to authorize the deletes, then remove it again.
const email = `cleanup-${Date.now()}@example.com`
await createUserWithEmailAndPassword(auth, email, 'TestPass123!')

for (const p of seedProjects) {
  await deleteDoc(doc(db, 'projects', p.id))
  console.log(`Deleted orphaned ${p.id}`)
}

await deleteUser(auth.currentUser)
console.log('Done.')
