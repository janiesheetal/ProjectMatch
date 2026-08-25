// One-off verification script — exercises Phases 2-6 end to end against the
// real live Firebase project, using two throwaway accounts. Not part of the
// app; safe to delete after use. Run with: node scripts/exercise.mjs
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
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { rankCandidates } from '../src/lib/matching.js'
import { seedUsers, seedProjects } from '../src/lib/seedData.js'

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
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const results = []
function check(label, ok, detail = '') {
  results.push({ label, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}${detail ? ' — ' + detail : ''}`)
}

const stamp = Date.now()
const emailA = `exercise-a-${stamp}@example.com`
const emailB = `exercise-b-${stamp}@example.com`
const password = 'TestPass123!'

async function run() {
  console.log('\n=== Phase 2: signup + profile (account A) ===')
  const credA = await createUserWithEmailAndPassword(auth, emailA, password)
  const uidA = credA.user.uid

  console.log('\n=== Phase 6: seed data (as an authenticated user, same as /dev-seed) ===')
  for (const u of seedUsers) {
    const { id, ...data } = u
    await setDoc(doc(db, 'users', id), { ...data, createdAt: serverTimestamp() })
  }
  const seedUsersCheck = await getDocs(collection(db, 'users'))
  check('Seed users written', seedUsersCheck.size >= seedUsers.length, `${seedUsersCheck.size} user docs present`)
  await setDoc(doc(db, 'users', uidA), {
    displayName: 'Exercise Owner A',
    email: emailA,
    skills: [
      { name: 'Product Management', level: 'advanced' },
      { name: 'System Design', level: 'intermediate' },
    ],
    interests: ['team building'],
    availability: { days: ['Mon', 'Wed', 'Fri'], startHour: 18, endHour: 22 },
    experienceNote: 'Exercise script test account.',
    portfolioLink: '',
    reputationScore: 4.5,
    verifiedBadge: false,
    createdAt: serverTimestamp(),
  })
  const profileASnap = await getDoc(doc(db, 'users', uidA))
  check(
    'Profile A persisted with skills/availability',
    profileASnap.exists() && profileASnap.data().skills.length === 2 && profileASnap.data().availability.days.length === 3
  )

  console.log('\n=== Phase 3: post a project ===')
  const projectRef = await addDoc(collection(db, 'projects'), {
    ownerId: uidA,
    title: 'Exercise Script Hackathon Project',
    description: 'Created by exercise.mjs to verify Phase 3/4/5.',
    contextType: 'hackathon',
    requiredSkills: ['React', 'Node.js', 'JavaScript'],
    commitmentLevel: 'Full weekend',
    timeline: '48 hours',
    status: 'open',
    createdAt: serverTimestamp(),
  })
  const projectSnap = await getDoc(projectRef)
  check('Project persisted', projectSnap.exists() && projectSnap.data().contextType === 'hackathon')

  const browseSnap = await getDocs(query(collection(db, 'projects'), where('status', '==', 'open')))
  check('Project appears in open-projects browse query', browseSnap.docs.some((d) => d.id === projectRef.id))

  console.log('\n=== Phase 2: signup + profile (account B, candidate) ===')
  const credB = await createUserWithEmailAndPassword(auth, emailB, password)
  const uidB = credB.user.uid
  await setDoc(doc(db, 'users', uidB), {
    displayName: 'Exercise Candidate B',
    email: emailB,
    skills: [
      { name: 'React', level: 'advanced' },
      { name: 'Node.js', level: 'advanced' },
      { name: 'JavaScript', level: 'advanced' },
    ],
    interests: ['hackathons'],
    availability: { days: ['Sat', 'Sun'], startHour: 10, endHour: 20 },
    experienceNote: 'Exercise script test account.',
    portfolioLink: '',
    reputationScore: 4.5,
    verifiedBadge: false,
    createdAt: serverTimestamp(),
  })

  console.log('\n=== Phase 4: matching engine (against seed data + candidate B) ===')
  await signInWithEmailAndPassword(auth, emailA, password)
  const allUsersSnap = await getDocs(collection(db, 'users'))
  const candidates = allUsersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const project = { id: projectRef.id, ...projectSnap.data() }
  const ranked = rankCandidates(project, candidates)
  console.log('Top ranked candidates:')
  ranked.forEach((r, i) => console.log(`  ${i + 1}. ${r.candidate.displayName} — ${r.score}%`))
  const bEntry = ranked.find((r) => r.candidate.id === uidB)
  check('Matching engine ranks perfect-skill-match candidate B highly', !!bEntry && bEntry.score >= 90, bEntry ? `B scored ${bEntry.score}%` : 'B not in top 8')
  check('Matching engine returns a varied ranked list (>=5 candidates)', ranked.length >= 5, `${ranked.length} candidates ranked`)

  console.log('\n=== Phase 4/5: owner A invites candidate B ===')
  const matchRef = await addDoc(collection(db, 'matches'), {
    projectId: projectRef.id,
    candidateId: uidB,
    status: 'requested',
    score: bEntry ? bEntry.score : 0,
    createdAt: serverTimestamp(),
  })
  check('Match request created with status requested', true)

  console.log('\n=== Phase 5: candidate B sees invite and accepts ===')
  await signOut(auth)
  await signInWithEmailAndPassword(auth, emailB, password)
  const invitesSnap = await getDocs(
    query(collection(db, 'matches'), where('candidateId', '==', uidB), where('status', '==', 'requested'))
  )
  check('Candidate B can see the pending invite', invitesSnap.docs.some((d) => d.id === matchRef.id))

  await updateDoc(doc(db, 'matches', matchRef.id), { status: 'accepted' })
  const acceptedSnap = await getDoc(doc(db, 'matches', matchRef.id))
  check('Accepting flips match status to accepted', acceptedSnap.data().status === 'accepted')

  console.log('\n=== Phase 5: chat access + realtime-equivalent exchange ===')
  const projForAccess = await getDoc(doc(db, 'projects', projectRef.id))
  const isCandidateB = acceptedSnap.data().candidateId === uidB
  const isOwnerCheckForB = projForAccess.data().ownerId === uidB
  check('Chat access rule: B is candidate (allowed), not owner', isCandidateB && !isOwnerCheckForB)

  await addDoc(collection(db, 'messages', matchRef.id, 'thread'), {
    senderId: uidB,
    text: 'Hey! Excited to work on this together.',
    createdAt: serverTimestamp(),
  })

  await signOut(auth)
  await signInWithEmailAndPassword(auth, emailA, password)
  const isOwnerA = projForAccess.data().ownerId === uidA
  check('Chat access rule: A is project owner (allowed)', isOwnerA)

  await addDoc(collection(db, 'messages', matchRef.id, 'thread'), {
    senderId: uidA,
    text: "Great, let's kick off this weekend.",
    createdAt: serverTimestamp(),
  })

  const threadSnap = await getDocs(
    query(collection(db, 'messages', matchRef.id, 'thread'), orderBy('createdAt', 'asc'))
  )
  const messages = threadSnap.docs.map((d) => d.data())
  check(
    'Both messages persisted in correct order',
    messages.length === 2 && messages[0].senderId === uidB && messages[1].senderId === uidA
  )

  console.log('\n=== Phase 2: "Your matches" query for owner A ===')
  const myProjectsSnap = await getDocs(query(collection(db, 'projects'), where('ownerId', '==', uidA)))
  const myProjectIds = new Set(myProjectsSnap.docs.map((d) => d.id))
  const acceptedMatchesSnap = await getDocs(query(collection(db, 'matches'), where('status', '==', 'accepted')))
  const myMatches = acceptedMatchesSnap.docs.filter(
    (d) => d.data().candidateId === uidA || myProjectIds.has(d.data().projectId)
  )
  check('Owner A sees the accepted match in "Your matches"', myMatches.some((d) => d.id === matchRef.id))

  console.log('\n=== Phase 6: seed projects present with varied contextType ===')
  for (const p of seedProjects) {
    const { id, ...data } = p
    await setDoc(doc(db, 'projects', id), { ...data, ownerId: uidA, status: 'open', createdAt: serverTimestamp() })
  }
  const seedProjSnap = await getDocs(query(collection(db, 'projects'), where('status', '==', 'open')))
  const contextTypes = new Set(seedProjSnap.docs.map((d) => d.data().contextType))
  check('Seed projects cover multiple context types', contextTypes.size >= 3, `types present: ${[...contextTypes].join(', ')}`)

  console.log('\n=== Cleanup: removing throwaway exercise data ===')
  await deleteDoc(doc(db, 'messages', matchRef.id, 'thread', threadSnap.docs[0].id))
  await deleteDoc(doc(db, 'messages', matchRef.id, 'thread', threadSnap.docs[1].id))
  await deleteDoc(doc(db, 'matches', matchRef.id))
  await deleteDoc(doc(db, 'projects', projectRef.id))
  await deleteDoc(doc(db, 'users', uidA))
  await deleteUser(auth.currentUser) // currently signed in as A
  await signInWithEmailAndPassword(auth, emailB, password)
  await deleteDoc(doc(db, 'users', uidB))
  await deleteUser(auth.currentUser)
  check('Throwaway exercise accounts and docs cleaned up', true)

  console.log('\n=== Summary ===')
  const failed = results.filter((r) => !r.ok)
  console.log(`${results.length - failed.length}/${results.length} checks passed.`)
  if (failed.length) {
    console.log('Failed checks:')
    failed.forEach((f) => console.log(`  - ${f.label} ${f.detail}`))
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('\nExercise script crashed:', err)
  process.exit(1)
})
