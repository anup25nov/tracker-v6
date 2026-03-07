export interface Topic {
  id: string;
  name: string;
  nameHi: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  topics: Topic[];
}

export const initialSyllabus: Subject[] = [
  {
    id: "quant",
    name: "Quantitative Aptitude",
    nameHi: "गणित",
    icon: "📐",
    topics: [
      { id: "q1", name: "Number System", nameHi: "संख्या पद्धति", completed: false },
      { id: "q2", name: "Simplification", nameHi: "सरलीकरण", completed: false },
      { id: "q3", name: "Percentage", nameHi: "प्रतिशत", completed: false },
      { id: "q4", name: "Ratio & Proportion", nameHi: "अनुपात एवं समानुपात", completed: false },
      { id: "q5", name: "Average", nameHi: "औसत", completed: false },
      { id: "q6", name: "Profit and Loss", nameHi: "लाभ और हानि", completed: false },
      { id: "q7", name: "Time and Work", nameHi: "समय और कार्य", completed: false },
      { id: "q8", name: "Time Speed Distance", nameHi: "समय चाल दूरी", completed: false },
      { id: "q9", name: "Mixture & Alligation", nameHi: "मिश्रण एवं एलिगेशन", completed: false },
      { id: "q10", name: "Simple Interest", nameHi: "साधारण ब्याज", completed: false },
      { id: "q11", name: "Compound Interest", nameHi: "चक्रवृद्धि ब्याज", completed: false },
      { id: "q12", name: "Algebra", nameHi: "बीजगणित", completed: false },
      { id: "q13", name: "Geometry", nameHi: "ज्यामिति", completed: false },
      { id: "q14", name: "Trigonometry", nameHi: "त्रिकोणमिति", completed: false },
      { id: "q15", name: "Mensuration", nameHi: "क्षेत्रमिति", completed: false },
      { id: "q16", name: "Data Interpretation", nameHi: "आंकड़ों की व्याख्या", completed: false },
    ],
  },
  {
    id: "reasoning",
    name: "Reasoning",
    nameHi: "तर्कशक्ति",
    icon: "🧠",
    topics: [
      { id: "r1", name: "Analogy", nameHi: "सादृश्यता", completed: false },
      { id: "r2", name: "Classification", nameHi: "वर्गीकरण", completed: false },
      { id: "r3", name: "Coding Decoding", nameHi: "कोडिंग डिकोडिंग", completed: false },
      { id: "r4", name: "Blood Relation", nameHi: "रक्त संबंध", completed: false },
      { id: "r5", name: "Direction", nameHi: "दिशा", completed: false },
      { id: "r6", name: "Series", nameHi: "श्रृंखला", completed: false },
      { id: "r7", name: "Venn Diagram", nameHi: "वेन आरेख", completed: false },
      { id: "r8", name: "Puzzle", nameHi: "पहेली", completed: false },
      { id: "r9", name: "Syllogism", nameHi: "न्याय निगमन", completed: false },
      { id: "r10", name: "Clock", nameHi: "घड़ी", completed: false },
      { id: "r11", name: "Calendar", nameHi: "कैलेंडर", completed: false },
      { id: "r12", name: "Missing Number", nameHi: "लुप्त संख्या", completed: false },
    ],
  },
  {
    id: "english",
    name: "English",
    nameHi: "अंग्रेजी",
    icon: "📝",
    topics: [
      { id: "e1", name: "Reading Comprehension", nameHi: "पठन बोध", completed: false },
      { id: "e2", name: "Cloze Test", nameHi: "क्लोज टेस्ट", completed: false },
      { id: "e3", name: "Error Detection", nameHi: "त्रुटि पहचान", completed: false },
      { id: "e4", name: "Sentence Improvement", nameHi: "वाक्य सुधार", completed: false },
      { id: "e5", name: "Fill in the Blanks", nameHi: "रिक्त स्थान भरें", completed: false },
      { id: "e6", name: "Synonyms", nameHi: "पर्यायवाची", completed: false },
      { id: "e7", name: "Antonyms", nameHi: "विलोम शब्द", completed: false },
      { id: "e8", name: "Idioms & Phrases", nameHi: "मुहावरे और लोकोक्तियाँ", completed: false },
      { id: "e9", name: "One Word Substitution", nameHi: "एक शब्द प्रतिस्थापन", completed: false },
      { id: "e10", name: "Active Passive", nameHi: "कर्तृ कर्म वाच्य", completed: false },
      { id: "e11", name: "Direct Indirect Speech", nameHi: "प्रत्यक्ष अप्रत्यक्ष कथन", completed: false },
    ],
  },
  {
    id: "ga",
    name: "General Awareness",
    nameHi: "सामान्य जागरूकता",
    icon: "🌍",
    topics: [
      { id: "g1", name: "History", nameHi: "इतिहास", completed: false },
      { id: "g2", name: "Geography", nameHi: "भूगोल", completed: false },
      { id: "g3", name: "Polity", nameHi: "राजव्यवस्था", completed: false },
      { id: "g4", name: "Economy", nameHi: "अर्थव्यवस्था", completed: false },
      { id: "g5", name: "Physics", nameHi: "भौतिक विज्ञान", completed: false },
      { id: "g6", name: "Chemistry", nameHi: "रसायन विज्ञान", completed: false },
      { id: "g7", name: "Biology", nameHi: "जीव विज्ञान", completed: false },
      { id: "g8", name: "Static GK", nameHi: "स्थैतिक सामान्य ज्ञान", completed: false },
      { id: "g9", name: "Current Affairs", nameHi: "करंट अफेयर्स", completed: false },
    ],
  },
];
