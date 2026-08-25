// Verifies corridor board, topic rooms, direct messaging, and the fairness-
// aware day-scholar ranking boost against the live Firebase project.
// Run with: node scripts/exercise2.mjs
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { rankCandidates, projectRelevanceScore } from '../src/lib/matching.js'
import { dmIdFor } from '../src/lib/dm.js'

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

const results = []
function check(label, ok, detail = '') {
  results.push({ label, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}${detail ? ' — ' + detail : ''}`)
}

const stamp = Date.now()
const emailOwner = `ex2-owner-${stamp}@example.com`
const emailNormal = `ex2-normal-${stamp}@example.com`
const emailScholar = `ex2-scholar-${stamp}@example.com`
const password = 'TestPass123!'

async function run() {
  console.log('\n=== Fairness-aware ranking: identical skills, only isDayScholar differs ===')
  const credOwner = await createUserWithEmailAndPassword(auth, emailOwner, password)
  const uidOwner = credOwner.user.uid

  const credNormal = await createUserWithEmailAndPassword(auth, emailNormal, password)
  const uidNormal = credNormal.user.uid
  await setDoc(doc(db, 'users', uidNormal), {
    displayName: 'Ex2 Normal',
    email: emailNormal,
    skills: [{ name: 'React', level: 'intermediate' }],
    interests: [],
    availability: { days: ['Mon'], startHour: 9, endHour: 17 },
    experienceNote: '',
    portfolioLink: '',
    reputationScore: 4.5,
    verifiedBadge: false,
    isDayScholar: false,
    createdAt: serverTimestamp(),
  })

  const credScholar = await createUserWithEmailAndPassword(auth, emailScholar, password)
  const uidScholar = credScholar.user.uid
  await setDoc(doc(db, 'users', uidScholar), {
    displayName: 'Ex2 Scholar',
    email: emailScholar,
    skills: [{ name: 'React', level: 'intermediate' }],
    interests: [],
    availability: { days: ['Mon'], startHour: 9, endHour: 17 },
    experienceNote: '',
    portfolioLink: '',
    reputationScore: 4.5,
    verifiedBadge: false,
    isDayScholar: true,
    createdAt: serverTimestamp(),
  })

  await signInWithEmailAndPassword(auth, emailOwner, password)
  const project = {
    ownerId: uidOwner,
    requiredSkills: ['React', 'Node.js', 'JavaScript'],
  }
  const ranked = rankCandidates(project, [
    { id: uidNormal, ...(await getDoc(doc(db, 'users', uidNormal))).data() },
    { id: uidScholar, ...(await getDoc(doc(db, 'users', uidScholar))).data() },
  ])
  const normalEntry = ranked.find((r) => r.candidate.id === uidNormal)
  const scholarEntry = ranked.find((r) => r.candidate.id === uidScholar)
  console.log(`  Normal score: ${normalEntry.score}%, Day-scholar score: ${scholarEntry.score}%`)
  check(
    'Day-scholar candidate scores strictly higher with identical skills',
    scholarEntry.score > normalEntry.score
  )

  console.log('\n=== Browse relevance sort: projectRelevanceScore ===')
  const highRelevance = { requiredSkills: ['React', 'Node.js'] }
  const lowRelevance = { requiredSkills: ['Robotics', 'Embedded C'] }
  const myScoreHigh = projectRelevanceScore(highRelevance, [{ name: 'React', level: 'advanced' }, { name: 'Node.js', level: 'advanced' }])
  const myScoreLow = projectRelevanceScore(lowRelevance, [{ name: 'React', level: 'advanced' }, { name: 'Node.js', level: 'advanced' }])
  check('Relevant project scores higher than irrelevant one', myScoreHigh > myScoreLow, `${myScoreHigh} vs ${myScoreLow}`)

  console.log('\n=== Corridor board ===')
  const boardRef = await addDoc(collection(db, 'boardPosts'), {
    authorId: uidOwner,
    authorName: 'Ex2 Owner',
    text: 'Exercise2 test note.',
    createdAt: serverTimestamp(),
  })
  const boardReadSnap = await getDocs(query(collection(db, 'boardPosts'), orderBy('createdAt', 'desc')))
  check('Board post readable back', boardReadSnap.docs.some((d) => d.id === boardRef.id))

  console.log('\n=== Topic rooms ===')
  const topicPostRef = await addDoc(collection(db, 'topicRooms', 'generative-ai', 'posts'), {
    authorId: uidOwner,
    authorName: 'Ex2 Owner',
    text: 'Exercise2 topic post.',
    createdAt: serverTimestamp(),
  })
  const topicReadSnap = await getDocs(
    query(collection(db, 'topicRooms', 'generative-ai', 'posts'), orderBy('createdAt', 'asc'))
  )
  check('Topic room post readable back', topicReadSnap.docs.some((d) => d.id === topicPostRef.id))

  console.log('\n=== Direct messaging (owner <-> normal candidate) ===')
  const dmId = dmIdFor(uidOwner, uidNormal)
  await setDoc(doc(db, 'dms', dmId), { participants: [uidOwner, uidNormal], updatedAt: serverTimestamp() }, { merge: true })
  await addDoc(collection(db, 'dms', dmId, 'thread'), {
    senderId: uidOwner,
    text: 'Hey, saw your corridor board post!',
    createdAt: serverTimestamp(),
  })

  await signOut(auth)
  await signInWithEmailAndPassword(auth, emailNormal, password)
  const myDmsSnap = await getDocs(query(collection(db, 'dms'), where('participants', 'array-contains', uidNormal)))
  check('Recipient sees the DM thread in their inbox query', myDmsSnap.docs.some((d) => d.id === dmId))

  await addDoc(collection(db, 'dms', dmId, 'thread'), {
    senderId: uidNormal,
    text: 'Yeah! Would love to chat.',
    createdAt: serverTimestamp(),
  })
  const threadSnap = await getDocs(query(collection(db, 'dms', dmId, 'thread'), orderBy('createdAt', 'asc')))
  check('Both DM messages persisted in order', threadSnap.docs.length === 2 && threadSnap.docs[0].data().senderId === uidOwner)

  console.log('\n=== Cleanup ===')
  await deleteDoc(doc(db, 'boardPosts', boardRef.id))
  await deleteDoc(doc(db, 'topicRooms', 'generative-ai', 'posts', topicPostRef.id))
  for (const d of threadSnap.docs) await deleteDoc(doc(db, 'dms', dmId, 'thread', d.id))
  await deleteDoc(doc(db, 'dms', dmId))
  await deleteDoc(doc(db, 'users', uidNormal))
  await deleteUser(auth.currentUser) // signed in as normal
  await signInWithEmailAndPassword(auth, emailScholar, password)
  await deleteDoc(doc(db, 'users', uidScholar))
  await deleteUser(auth.currentUser)
  await signInWithEmailAndPassword(auth, emailOwner, password)
  await deleteUser(auth.currentUser)
  check('Throwaway accounts and docs cleaned up', true)

  console.log('\n=== Summary ===')
  const failed = results.filter((r) => !r.ok)
  console.log(`${results.length - failed.length}/${results.length} checks passed.`)
  if (failed.length) {
    failed.forEach((f) => console.log(`  - FAILED: ${f.label} ${f.detail}`))
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('\nExercise2 script crashed:', err)
  process.exit(1)
})
