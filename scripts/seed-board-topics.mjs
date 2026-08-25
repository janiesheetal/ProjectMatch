import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { seedBoardPosts, seedTopicPosts } from '../src/lib/seedData.js'

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

await createUserWithEmailAndPassword(auth, `board-seed-${Date.now()}@example.com`, 'TestPass123!')

for (const [i, post] of seedBoardPosts.entries()) {
  await setDoc(doc(db, 'boardPosts', `seed-board-${i}`), { ...post, createdAt: serverTimestamp() })
}
console.log(`Wrote ${seedBoardPosts.length} corridor board posts.`)

for (const [topicId, posts] of Object.entries(seedTopicPosts)) {
  for (const [i, post] of posts.entries()) {
    await setDoc(doc(db, 'topicRooms', topicId, 'posts', `seed-${i}`), { ...post, createdAt: serverTimestamp() })
  }
  console.log(`Wrote ${posts.length} posts to #${topicId}.`)
}

await deleteUser(auth.currentUser)
console.log('Done, throwaway seeding account removed.')
