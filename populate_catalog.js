// Sample script to populate the course catalog
// Run this once to add template courses to your Firestore database

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin (update with your credentials)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const sampleCourses = [
  {
    name: "Mathematics Grade 7 Complete",
    grade: "7",
    subjects: [
      {
        subject: "Mathematics",
        strands: [
          { id: "numbers", name: "Numbers", description: "Number operations and properties" },
          { id: "algebra", name: "Algebra", description: "Basic algebraic concepts" },
        ],
      },
    ],
    description: "A comprehensive mathematics course covering all Grade 7 topics including numbers, algebra, geometry, and statistics.",
    courseType: "cbc",
    chapters: [
      {
        id: "ch1",
        order: 1,
        title: "Introduction to Integers",
        subject: "Mathematics",
        strandId: "numbers",
        strandName: "Numbers",
        topics: ["Positive and negative numbers", "Number line", "Comparing integers"],
      },
      {
        id: "ch2",
        order: 2,
        title: "Operations with Integers",
        subject: "Mathematics",
        strandId: "numbers",
        strandName: "Numbers",
        topics: ["Addition and subtraction", "Multiplication and division", "Order of operations"],
      },
      {
        id: "ch3",
        order: 3,
        title: "Introduction to Algebra",
        subject: "Mathematics",
        strandId: "algebra",
        strandName: "Algebra",
        topics: ["Variables and expressions", "Solving simple equations", "Word problems"],
      },
    ],
    totalChapters: 3,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    estimatedDuration: "8 weeks",
    difficulty: "intermediate",
    enrollmentCount: 0,
    isPublic: true,
  },
  {
    name: "Science Grade 8 - Living Things",
    grade: "8",
    subjects: [
      {
        subject: "Science",
        strands: [
          { id: "biology", name: "Biology", description: "Study of living organisms" },
        ],
      },
    ],
    description: "Explore the fascinating world of living organisms, from cells to ecosystems. Perfect for Grade 8 students.",
    courseType: "cbc",
    chapters: [
      {
        id: "ch1",
        order: 1,
        title: "Cell Structure and Function",
        subject: "Science",
        strandId: "biology",
        strandName: "Biology",
        topics: ["Plant cells", "Animal cells", "Cell organelles"],
      },
      {
        id: "ch2",
        order: 2,
        title: "Classification of Living Things",
        subject: "Science",
        strandId: "biology",
        strandName: "Biology",
        topics: ["Five kingdoms", "Taxonomy", "Binomial nomenclature"],
      },
      {
        id: "ch3",
        order: 3,
        title: "Ecosystems and Food Chains",
        subject: "Science",
        strandId: "biology",
        strandName: "Biology",
        topics: ["Producers and consumers", "Food webs", "Energy flow"],
      },
    ],
    totalChapters: 3,
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400",
    estimatedDuration: "6 weeks",
    difficulty: "beginner",
    enrollmentCount: 0,
    isPublic: true,
  },
  {
    name: "English Grade 6 - Reading & Writing",
    grade: "6",
    subjects: [
      {
        subject: "English",
        strands: [
          { id: "reading", name: "Reading", description: "Reading comprehension and analysis" },
          { id: "writing", name: "Writing", description: "Creative and formal writing" },
        ],
      },
    ],
    description: "Develop strong reading comprehension and writing skills through engaging stories and practical exercises.",
    courseType: "cbc",
    chapters: [
      {
        id: "ch1",
        order: 1,
        title: "Reading Comprehension Strategies",
        subject: "English",
        strandId: "reading",
        strandName: "Reading",
        topics: ["Main ideas", "Supporting details", "Making inferences"],
      },
      {
        id: "ch2",
        order: 2,
        title: "Paragraph Writing",
        subject: "English",
        strandId: "writing",
        strandName: "Writing",
        topics: ["Topic sentences", "Supporting sentences", "Concluding sentences"],
      },
      {
        id: "ch3",
        order: 3,
        title: "Creative Writing",
        subject: "English",
        strandId: "writing",
        strandName: "Writing",
        topics: ["Story structure", "Character development", "Descriptive language"],
      },
      {
        id: "ch4",
        order: 4,
        title: "Poetry and Literary Devices",
        subject: "English",
        strandId: "reading",
        strandName: "Reading",
        topics: ["Similes and metaphors", "Rhyme and rhythm", "Imagery"],
      },
    ],
    totalChapters: 4,
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
    estimatedDuration: "10 weeks",
    difficulty: "beginner",
    enrollmentCount: 0,
    isPublic: true,
  },
];

async function populateCatalog() {
  console.log('Starting to populate course catalog...');

  try {
    const batch = db.batch();

    for (const course of sampleCourses) {
      const docRef = db.collection('courseCatalog').doc();
      batch.set(docRef, {
        ...course,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`Added: ${course.name}`);
    }

    await batch.commit();
    console.log(`Successfully added ${sampleCourses.length} courses to catalog!`);
  } catch (error) {
    console.error('Error populating catalog:', error);
  }
}

// Run the script
populateCatalog();
