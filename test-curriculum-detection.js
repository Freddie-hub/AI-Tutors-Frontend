// Test script to verify GCSE curriculum detection
// Run in browser console on GCSE dashboard

function testCurriculumDetection() {
  const testCases = [
    {
      grade: "Cambridge IGCSE (British-style) - Year 10 / Grade 9",
      expected: "gcse"
    },
    {
      grade: "Cambridge International AS Level (British-style) - Year 12 / Grade 11",
      expected: "gcse"
    },
    {
      grade: "Cambridge Primary (British-style) - Stage 1 / Year 1",
      expected: "gcse"
    },
    {
      grade: "Kenya Competency-Based Curriculum (CBC) - Grade 7",
      expected: "cbc"
    },
  ];

  console.log("🧪 Testing Curriculum Detection...\n");

  testCases.forEach(({ grade, expected }) => {
    const detected = grade.toLowerCase().includes('cambridge') || 
                     grade.toLowerCase().includes('gcse') || 
                     grade.toLowerCase().includes('igcse') || 
                     grade.toLowerCase().includes('british') || 
                     grade.toLowerCase().includes('year') ? 'gcse' : 'cbc';
    
    const pass = detected === expected;
    const icon = pass ? "✅" : "❌";
    
    console.log(`${icon} Grade: "${grade}"`);
    console.log(`   Expected: ${expected}, Detected: ${detected}\n`);
  });
}

// Run the test
testCases();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCurriculumDetection };
}
