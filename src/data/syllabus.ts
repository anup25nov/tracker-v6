export interface Subtopic {
  id: string;
  name: string;
  nameHi: string;
  completed: boolean;
}

export interface Topic {
  id: string;
  name: string;
  nameHi: string;
  completed: boolean;
  subtopics?: Subtopic[];
}

export interface Subject {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  topics: Topic[];
}

export interface Exam {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  icon: string;
  color: string;
  subjects: Subject[];
}

/** Count completable units in a subject (1 per topic, or subtopic count if topic has subtopics) */
export function countSubjectUnits(subject: Subject): number {
  return subject.topics.reduce((acc, t) => acc + (t.subtopics?.length ?? 1), 0);
}

/** Count total units in an exam */
export function countExamUnits(exam: Exam): number {
  return exam.subjects.reduce((acc, s) => acc + countSubjectUnits(s), 0);
}

export const allExams: Exam[] = [
  {
    id: "ssc-cgl",
    name: "SSC CGL",
    nameHi: "SSC CGL",
    description: "Combined Graduate Level Examination",
    descriptionHi: "संयुक्त स्नातक स्तरीय परीक्षा",
    icon: "🏛️",
    color: "217 91% 60%",
    subjects: [
      {
      id:"quant",
      name:"Quantitative Aptitude",
      nameHi:"गणित",
      icon:"📐",
      topics:[
      
      {
      id:"q1",
      name:"Arithmetic",
      nameHi:"अंकगणित",
      completed:false,
      subtopics:[
      { id:"q1-1", name:"Number System", nameHi:"संख्या पद्धति", completed:false },
      { id:"q1-2", name:"Simplification / Surds & Indices", nameHi:"सरलीकरण / घातांक", completed:false },
      { id:"q1-3", name:"LCM & HCF", nameHi:"लघुत्तम समापवर्त्य / महत्तम समापवर्त्य", completed:false },
      { id:"q1-4", name:"Percentage", nameHi:"प्रतिशत", completed:false },
      { id:"q1-5", name:"Ratio & Proportion", nameHi:"अनुपात एवं समानुपात", completed:false },
      { id:"q1-6", name:"Partnership", nameHi:"साझेदारी", completed:false },
      { id:"q1-7", name:"Average", nameHi:"औसत", completed:false },
      { id:"q1-8", name:"Profit & Loss", nameHi:"लाभ और हानि", completed:false },
      { id:"q1-9", name:"Discount", nameHi:"छूट", completed:false },
      { id:"q1-10", name:"Simple Interest", nameHi:"साधारण ब्याज", completed:false },
      { id:"q1-11", name:"Compound Interest", nameHi:"चक्रवृद्धि ब्याज", completed:false },
      { id:"q1-12", name:"Mixture & Alligation", nameHi:"मिश्रण एवं एलिगेशन", completed:false },
      { id:"q1-13", name:"Time & Work", nameHi:"समय और कार्य", completed:false },
      { id:"q1-14", name:"Pipes & Cisterns", nameHi:"पाइप और टंकी", completed:false },
      { id:"q1-15", name:"Time Speed Distance", nameHi:"समय चाल दूरी", completed:false },
      { id:"q1-16", name:"Boats & Streams", nameHi:"नाव और धारा", completed:false },
      { id:"q1-17", name:"Problems on Ages", nameHi:"आयु संबंधी प्रश्न", completed:false }
      ]
      },
      
      {
      id:"q2",
      name:"Algebra",
      nameHi:"बीजगणित",
      completed:false,
      subtopics:[
      { id:"q2-1", name:"Basic Algebraic Identities", nameHi:"बीजगणितीय सर्वसमिकाएँ", completed:false },
      { id:"q2-2", name:"Linear Equations", nameHi:"रेखीय समीकरण", completed:false },
      { id:"q2-3", name:"Quadratic Equations", nameHi:"द्विघात समीकरण", completed:false },
      { id:"q2-4", name:"Inequalities", nameHi:"असमानताएँ", completed:false }
      ]
      },
      
      {
      id:"q3",
      name:"Geometry",
      nameHi:"ज्यामिति",
      completed:false,
      subtopics:[
      { id:"q3-1", name:"Lines and Angles", nameHi:"रेखाएँ और कोण", completed:false },
      { id:"q3-2", name:"Triangle and its Properties", nameHi:"त्रिभुज के गुण", completed:false },
      { id:"q3-3", name:"Congruence and Similarity", nameHi:"सर्वांगसमता और समानता", completed:false },
      { id:"q3-4", name:"Circle and its Chords / Tangents", nameHi:"वृत्त और उसकी स्पर्श रेखाएँ", completed:false },
      { id:"q3-5", name:"Quadrilaterals", nameHi:"चतुर्भुज", completed:false },
      { id:"q3-6", name:"Polygon Basics", nameHi:"बहुभुज", completed:false }
      ]
      },
      
      {
      id:"q4",
      name:"Mensuration",
      nameHi:"क्षेत्रमिति",
      completed:false,
      subtopics:[
      { id:"q4-1", name:"Triangle", nameHi:"त्रिभुज", completed:false },
      { id:"q4-2", name:"Square / Rectangle", nameHi:"वर्ग / आयत", completed:false },
      { id:"q4-3", name:"Circle", nameHi:"वृत्त", completed:false },
      { id:"q4-4", name:"Trapezium", nameHi:"समलंब", completed:false },
      { id:"q4-5", name:"Sphere", nameHi:"गोला", completed:false },
      { id:"q4-6", name:"Hemisphere", nameHi:"अर्धगोला", completed:false },
      { id:"q4-7", name:"Cylinder", nameHi:"बेलन", completed:false },
      { id:"q4-8", name:"Cone", nameHi:"शंकु", completed:false }
      ]
      },
      
      {
      id:"q5",
      name:"Trigonometry",
      nameHi:"त्रिकोणमिति",
      completed:false,
      subtopics:[
      { id:"q5-1", name:"Trigonometric Ratios", nameHi:"त्रिकोणमितीय अनुपात", completed:false },
      { id:"q5-2", name:"Complementary Angles", nameHi:"पूरक कोण", completed:false },
      { id:"q5-3", name:"Standard Identities", nameHi:"मानक सर्वसमिकाएँ", completed:false },
      { id:"q5-4", name:"Heights & Distances", nameHi:"ऊँचाई और दूरी", completed:false }
      ]
      },
      
      {
      id:"q6",
      name:"Data Interpretation",
      nameHi:"आंकड़ों की व्याख्या",
      completed:false,
      subtopics:[
        { id:"q6-1", name:"Table", nameHi:"तालिका", completed:false },
        { id:"q6-2", name:"Bar Graph", nameHi:"बार ग्राफ", completed:false },
        { id:"q6-3", name:"Pie Chart", nameHi:"पाई चार्ट", completed:false },
        { id:"q6-4", name:"Line Graph", nameHi:"रेखा ग्राफ", completed:false },
        { id:"q6-5", name:"Mixed Graphs", nameHi:"मिश्रित ग्राफ", completed:false }
      ]
      }
      
      ]
      },
      
      {
      id:"reasoning",
      name:"Reasoning",
      nameHi:"तर्कशक्ति",
      icon:"🧠",
      topics:[
      
      {
      id:"r1",
      name:"Verbal Reasoning",
      nameHi:"मौखिक तर्क",
      completed:false,
      subtopics:[
        { id:"r1-1", name:"Analogy", nameHi:"सादृश्यता", completed:false },
        { id:"r1-2", name:"Classification", nameHi:"वर्गीकरण", completed:false },
        { id:"r1-3", name:"Coding Decoding", nameHi:"कोडिंग डिकोडिंग", completed:false },
        { id:"r1-4", name:"Alphabet Series", nameHi:"वर्णमाला श्रृंखला", completed:false },
        { id:"r1-5", name:"Number Series", nameHi:"संख्या श्रृंखला", completed:false },
        { id:"r1-6", name:"Word Formation", nameHi:"शब्द निर्माण", completed:false },
        { id:"r1-7", name:"Blood Relations", nameHi:"रक्त संबंध", completed:false },
        { id:"r1-8", name:"Direction Sense", nameHi:"दिशा परीक्षण", completed:false },
        { id:"r1-9", name:"Order & Ranking", nameHi:"क्रम और रैंकिंग", completed:false },
        { id:"r1-10", name:"Syllogism", nameHi:"न्याय निगमन", completed:false },
        { id:"r1-11", name:"Statement & Conclusion", nameHi:"कथन और निष्कर्ष", completed:false },
        { id:"r1-12", name:"Statement & Assumptions", nameHi:"कथन और मान्यता", completed:false },
        { id:"r1-13", name:"Statement & Arguments", nameHi:"कथन और तर्क", completed:false },
        { id:"r1-14", name:"Cause & Effect", nameHi:"कारण और प्रभाव", completed:false },
        { id:"r1-15", name:"Decision Making", nameHi:"निर्णय लेना", completed:false }
      ]
      },
      
      {
      id:"r2",
      name:"Logical / Mathematical Reasoning",
      nameHi:"तार्किक गणितीय तर्क",
      completed:false,
      subtopics:[
        { id:"r2-1", name:"Venn Diagrams", nameHi:"वेन आरेख", completed:false },
        { id:"r2-2", name:"Mathematical Operations", nameHi:"गणितीय संक्रियाएँ", completed:false },
        { id:"r2-3", name:"Missing Numbers", nameHi:"लुप्त संख्या", completed:false },
        { id:"r2-4", name:"Puzzle / Seating Arrangement", nameHi:"पहेली / बैठक व्यवस्था", completed:false }
      ]
      },
      
      {
      id:"r3",
      name:"Non Verbal Reasoning",
      nameHi:"गैर मौखिक तर्क",
      completed:false,
      subtopics:[
        { id:"r3-1", name:"Mirror Image", nameHi:"दर्पण प्रतिबिंब", completed:false },
        { id:"r3-2", name:"Water Image", nameHi:"जल प्रतिबिंब", completed:false },
        { id:"r3-3", name:"Paper Folding", nameHi:"कागज मोड़ना", completed:false },
        { id:"r3-4", name:"Paper Cutting", nameHi:"कागज काटना", completed:false },
        { id:"r3-5", name:"Embedded Figures", nameHi:"समाहित आकृतियाँ", completed:false },
        { id:"r3-6", name:"Figure Series", nameHi:"आकृति श्रृंखला", completed:false },
        { id:"r3-7", name:"Figure Completion", nameHi:"आकृति पूर्ण करना", completed:false },
        { id:"r3-8", name:"Cube & Dice", nameHi:"घन और पासा", completed:false },
        { id:"r3-9", name:"Pattern Folding", nameHi:"पैटर्न मोड़ना", completed:false }
      ]
      }
      
      ]
      },
      
      {
      id:"english",
      name:"English",
      nameHi:"अंग्रेजी",
      icon:"📝",
      topics:[
      
      {
      id:"e1",
      name:"Grammar",
      nameHi:"व्याकरण",
      completed:false,
      subtopics:[
        { id:"e1-1", name:"Parts of Speech", nameHi:"शब्द भेद", completed:false },
        { id:"e1-2", name:"Tenses", nameHi:"काल", completed:false },
        { id:"e1-3", name:"Articles", nameHi:"आर्टिकल", completed:false },
        { id:"e1-4", name:"Prepositions", nameHi:"पूर्वसर्ग", completed:false },
        { id:"e1-5", name:"Conjunctions", nameHi:"समुच्चय बोधक", completed:false },
        { id:"e1-6", name:"Active Passive Voice", nameHi:"कर्तृ कर्म वाच्य", completed:false },
        { id:"e1-7", name:"Direct Indirect Speech", nameHi:"प्रत्यक्ष अप्रत्यक्ष कथन", completed:false },
        { id:"e1-8", name:"Subject Verb Agreement", nameHi:"कर्ता क्रिया सामंजस्य", completed:false }
      ]
      },
      
      {
      id:"e2",
      name:"Vocabulary",
      nameHi:"शब्दावली",
      completed:false,
      subtopics:[
        { id:"e2-1", name:"Synonyms", nameHi:"पर्यायवाची", completed:false },
        { id:"e2-2", name:"Antonyms", nameHi:"विलोम शब्द", completed:false },
        { id:"e2-3", name:"One Word Substitution", nameHi:"एक शब्द प्रतिस्थापन", completed:false },
        { id:"e2-4", name:"Idioms & Phrases", nameHi:"मुहावरे और लोकोक्तियाँ", completed:false },
        { id:"e2-5", name:"Spelling Correction", nameHi:"वर्तनी सुधार", completed:false }
      ]
      },
      
      {
      id:"e3",
      name:"Sentence Usage",
      nameHi:"वाक्य प्रयोग",
      completed:false,
      subtopics:[
        { id:"e3-1", name:"Spotting Errors", nameHi:"त्रुटि पहचान", completed:false },
        { id:"e3-2", name:"Sentence Improvement", nameHi:"वाक्य सुधार", completed:false },
        { id:"e3-3", name:"Sentence Rearrangement", nameHi:"वाक्य क्रम", completed:false },
        { id:"e3-4", name:"Fill in the Blanks", nameHi:"रिक्त स्थान भरें", completed:false }
      ]
      },
      
      {
      id:"e4",
      name:"Reading",
      nameHi:"पठन",
      completed:false,
      subtopics:[
        { id:"e4-1", name:"Reading Comprehension", nameHi:"पठन बोध", completed:false },
        { id:"e4-2", name:"Cloze Test", nameHi:"क्लोज टेस्ट", completed:false }
      ]
      }
      
      ]
      },
      
      {
      id:"ga",
      name:"General Awareness",
      nameHi:"सामान्य जागरूकता",
      icon:"🌍",
      topics:[
      
      {
      id:"g1",
      name:"Static GK",
      nameHi:"स्थैतिक सामान्य ज्ञान",
      completed:false,
      subtopics:[
        { id:"g1-1", name:"Indian History", nameHi:"भारतीय इतिहास", completed:false },
        { id:"g1-2", name:"Indian Geography", nameHi:"भारतीय भूगोल", completed:false },
        { id:"g1-3", name:"Indian Polity", nameHi:"भारतीय राजव्यवस्था", completed:false },
        { id:"g1-4", name:"Indian Economy", nameHi:"भारतीय अर्थव्यवस्था", completed:false },
        { id:"g1-5", name:"Indian Culture", nameHi:"भारतीय संस्कृति", completed:false },
        { id:"g1-6", name:"Important Days", nameHi:"महत्वपूर्ण दिवस", completed:false },
        { id:"g1-7", name:"Books & Authors", nameHi:"पुस्तकें और लेखक", completed:false },
        { id:"g1-8", name:"Awards & Honors", nameHi:"पुरस्कार और सम्मान", completed:false },
        { id:"g1-9", name:"Sports", nameHi:"खेल", completed:false },
        { id:"g1-10", name:"Art & Culture", nameHi:"कला और संस्कृति", completed:false }
      ]
      },
      
      {
      id:"g2",
      name:"Science",
      nameHi:"विज्ञान",
      completed:false,
      subtopics:[
        { id:"g2-1", name:"Physics", nameHi:"भौतिक विज्ञान", completed:false },
        { id:"g2-2", name:"Chemistry", nameHi:"रसायन विज्ञान", completed:false },
        { id:"g2-3", name:"Biology", nameHi:"जीव विज्ञान", completed:false }
      ]
      },
      
      {
      id:"g3",
      name:"Miscellaneous",
      nameHi:"अन्य",
      completed:false,
      subtopics:[
        { id:"g3-1", name:"Inventions & Discoveries", nameHi:"आविष्कार और खोज", completed:false },
        { id:"g3-2", name:"Scientific Research", nameHi:"वैज्ञानिक अनुसंधान", completed:false },
        { id:"g3-3", name:"Environment & Ecology", nameHi:"पर्यावरण और पारिस्थितिकी", completed:false },
        { id:"g3-4", name:"Current Affairs", nameHi:"करंट अफेयर्स", completed:false }
      ]
      }
      
      ]
      }
      
      ],
  },
  {
    id: "ssc-chsl",
    name: "SSC CHSL",
    nameHi: "SSC CHSL",
    description: "Combined Higher Secondary Level",
    descriptionHi: "संयुक्त उच्चतर माध्यमिक स्तर",
    icon: "📋",
    color: "142 71% 45%",
    subjects: [
      {
        id: "quant", name: "Quantitative Aptitude", nameHi: "गणित", icon: "📐",
        topics: [
          { id: "cq1", name: "Number System", nameHi: "संख्या पद्धति", completed: false },
          { id: "cq2", name: "Percentage", nameHi: "प्रतिशत", completed: false },
          { id: "cq3", name: "Ratio & Proportion", nameHi: "अनुपात एवं समानुपात", completed: false },
          { id: "cq4", name: "Average", nameHi: "औसत", completed: false },
          { id: "cq5", name: "Profit and Loss", nameHi: "लाभ और हानि", completed: false },
          { id: "cq6", name: "Time and Work", nameHi: "समय और कार्य", completed: false },
          { id: "cq7", name: "Time Speed Distance", nameHi: "समय चाल दूरी", completed: false },
          { id: "cq8", name: "Simple & Compound Interest", nameHi: "साधारण एवं चक्रवृद्धि ब्याज", completed: false },
          { id: "cq9", name: "Geometry", nameHi: "ज्यामिति", completed: false },
          { id: "cq10", name: "Trigonometry", nameHi: "त्रिकोणमिति", completed: false },
          {
            id: "cq11",
            name: "Mensuration",
            nameHi: "क्षेत्रमिति",
            completed: false,
            subtopics: [
              { id: "cq11-1", name: "Triangle", nameHi: "त्रिभुज", completed: false },
              { id: "cq11-2", name: "Square / Rectangle", nameHi: "वर्ग / आयत", completed: false },
              { id: "cq11-3", name: "Circle", nameHi: "वृत्त", completed: false },
              { id: "cq11-4", name: "Trapezium", nameHi: "समलंब", completed: false },
              { id: "cq11-5", name: "Sphere", nameHi: "गोला", completed: false },
              { id: "cq11-6", name: "Hemisphere", nameHi: "अर्धगोला", completed: false },
              { id: "cq11-7", name: "Cylinder", nameHi: "बेलन", completed: false },
              { id: "cq11-8", name: "Cone", nameHi: "शंकु", completed: false },
            ],
          },
          { id: "cq12", name: "Data Interpretation", nameHi: "आंकड़ों की व्याख्या", completed: false },
          { id: "cq13", name: "Algebra", nameHi: "बीजगणित", completed: false },
        ],
      },
      {
        id: "reasoning", name: "Reasoning", nameHi: "तर्कशक्ति", icon: "🧠",
        topics: [
          { id: "cr1", name: "Analogy", nameHi: "सादृश्यता", completed: false },
          { id: "cr2", name: "Classification", nameHi: "वर्गीकरण", completed: false },
          { id: "cr3", name: "Coding Decoding", nameHi: "कोडिंग डिकोडिंग", completed: false },
          { id: "cr4", name: "Series", nameHi: "श्रृंखला", completed: false },
          { id: "cr5", name: "Blood Relation", nameHi: "रक्त संबंध", completed: false },
          { id: "cr6", name: "Direction", nameHi: "दिशा", completed: false },
          { id: "cr7", name: "Venn Diagram", nameHi: "वेन आरेख", completed: false },
          { id: "cr8", name: "Puzzle", nameHi: "पहेली", completed: false },
          { id: "cr9", name: "Non-Verbal Reasoning", nameHi: "अशाब्दिक तर्क", completed: false },
          { id: "cr10", name: "Mirror & Water Image", nameHi: "दर्पण एवं जल प्रतिबिम्ब", completed: false },
        ],
      },
      {
        id: "english", name: "English", nameHi: "अंग्रेजी", icon: "📝",
        topics: [
          { id: "ce1", name: "Reading Comprehension", nameHi: "पठन बोध", completed: false },
          { id: "ce2", name: "Error Detection", nameHi: "त्रुटि पहचान", completed: false },
          { id: "ce3", name: "Sentence Improvement", nameHi: "वाक्य सुधार", completed: false },
          { id: "ce4", name: "Fill in the Blanks", nameHi: "रिक्त स्थान भरें", completed: false },
          { id: "ce5", name: "Synonyms & Antonyms", nameHi: "पर्यायवाची एवं विलोम", completed: false },
          { id: "ce6", name: "Idioms & Phrases", nameHi: "मुहावरे और लोकोक्तियाँ", completed: false },
          { id: "ce7", name: "One Word Substitution", nameHi: "एक शब्द प्रतिस्थापन", completed: false },
          { id: "ce8", name: "Active Passive", nameHi: "कर्तृ कर्म वाच्य", completed: false },
          { id: "ce9", name: "Direct Indirect", nameHi: "प्रत्यक्ष अप्रत्यक्ष", completed: false },
          { id: "ce10", name: "Spelling Correction", nameHi: "वर्तनी सुधार", completed: false },
        ],
      },
      {
        id: "ga", name: "General Awareness", nameHi: "सामान्य जागरूकता", icon: "🌍",
        topics: [
          { id: "cg1", name: "History", nameHi: "इतिहास", completed: false },
          { id: "cg2", name: "Geography", nameHi: "भूगोल", completed: false },
          { id: "cg3", name: "Polity", nameHi: "राजव्यवस्था", completed: false },
          { id: "cg4", name: "Economy", nameHi: "अर्थव्यवस्था", completed: false },
          { id: "cg5", name: "Science", nameHi: "विज्ञान", completed: false },
          { id: "cg6", name: "Static GK", nameHi: "स्थैतिक सामान्य ज्ञान", completed: false },
          { id: "cg7", name: "Current Affairs", nameHi: "करंट अफेयर्स", completed: false },
        ],
      },
    ],
  },
  {
    id: "ssc-mts",
    name: "SSC MTS",
    nameHi: "SSC MTS",
    description: "Multi Tasking Staff",
    descriptionHi: "मल्टी टास्किंग स्टाफ",
    icon: "📦",
    color: "38 92% 50%",
    subjects: [
      {
        id: "reasoning", name: "Reasoning", nameHi: "तर्कशक्ति", icon: "🧠",
        topics: [
          { id: "mr1", name: "Analogy", nameHi: "सादृश्यता", completed: false },
          { id: "mr2", name: "Classification", nameHi: "वर्गीकरण", completed: false },
          { id: "mr3", name: "Coding Decoding", nameHi: "कोडिंग डिकोडिंग", completed: false },
          { id: "mr4", name: "Series", nameHi: "श्रृंखला", completed: false },
          { id: "mr5", name: "Direction", nameHi: "दिशा", completed: false },
          { id: "mr6", name: "Blood Relation", nameHi: "रक्त संबंध", completed: false },
          { id: "mr7", name: "Venn Diagram", nameHi: "वेन आरेख", completed: false },
          { id: "mr8", name: "Non-Verbal", nameHi: "अशाब्दिक", completed: false },
          { id: "mr9", name: "Mirror Image", nameHi: "दर्पण प्रतिबिम्ब", completed: false },
        ],
      },
      {
        id: "numerical", name: "Numerical Aptitude", nameHi: "संख्यात्मक अभिरुचि", icon: "🔢",
        topics: [
          { id: "mn1", name: "Number System", nameHi: "संख्या पद्धति", completed: false },
          { id: "mn2", name: "HCF & LCM", nameHi: "म.स. एवं ल.स.", completed: false },
          { id: "mn3", name: "Percentage", nameHi: "प्रतिशत", completed: false },
          { id: "mn4", name: "Ratio & Proportion", nameHi: "अनुपात", completed: false },
          { id: "mn5", name: "Average", nameHi: "औसत", completed: false },
          { id: "mn6", name: "Profit and Loss", nameHi: "लाभ और हानि", completed: false },
          { id: "mn7", name: "Time and Work", nameHi: "समय और कार्य", completed: false },
          { id: "mn8", name: "Time Speed Distance", nameHi: "समय चाल दूरी", completed: false },
        ],
      },
      {
        id: "english", name: "English", nameHi: "अंग्रेजी", icon: "📝",
        topics: [
          { id: "me1", name: "Error Detection", nameHi: "त्रुटि पहचान", completed: false },
          { id: "me2", name: "Sentence Completion", nameHi: "वाक्य पूर्ति", completed: false },
          { id: "me3", name: "Synonyms & Antonyms", nameHi: "पर्यायवाची एवं विलोम", completed: false },
          { id: "me4", name: "Idioms & Phrases", nameHi: "मुहावरे", completed: false },
          { id: "me5", name: "Spelling Correction", nameHi: "वर्तनी सुधार", completed: false },
          { id: "me6", name: "Comprehension", nameHi: "गद्यांश", completed: false },
        ],
      },
      {
        id: "ga", name: "General Awareness", nameHi: "सामान्य जागरूकता", icon: "🌍",
        topics: [
          { id: "mg1", name: "History", nameHi: "इतिहास", completed: false },
          { id: "mg2", name: "Geography", nameHi: "भूगोल", completed: false },
          { id: "mg3", name: "Polity", nameHi: "राजव्यवस्था", completed: false },
          { id: "mg4", name: "Science", nameHi: "विज्ञान", completed: false },
          { id: "mg5", name: "Current Affairs", nameHi: "करंट अफेयर्स", completed: false },
        ],
      },
    ],
  },
  {
    id: "ssc-gd",
    name: "SSC GD",
    nameHi: "SSC GD",
    description: "General Duty Constable",
    descriptionHi: "जनरल ड्यूटी कांस्टेबल",
    icon: "🛡️",
    color: "0 84% 60%",
    subjects: [
      {
        id: "reasoning", name: "Reasoning", nameHi: "तर्कशक्ति", icon: "🧠",
        topics: [
          { id: "gr1", name: "Analogy", nameHi: "सादृश्यता", completed: false },
          { id: "gr2", name: "Classification", nameHi: "वर्गीकरण", completed: false },
          { id: "gr3", name: "Coding Decoding", nameHi: "कोडिंग डिकोडिंग", completed: false },
          { id: "gr4", name: "Series", nameHi: "श्रृंखला", completed: false },
          { id: "gr5", name: "Direction", nameHi: "दिशा", completed: false },
          { id: "gr6", name: "Blood Relation", nameHi: "रक्त संबंध", completed: false },
          { id: "gr7", name: "Venn Diagram", nameHi: "वेन आरेख", completed: false },
          { id: "gr8", name: "Non-Verbal", nameHi: "अशाब्दिक", completed: false },
        ],
      },
      {
        id: "math", name: "Elementary Mathematics", nameHi: "प्रारंभिक गणित", icon: "🔢",
        topics: [
          { id: "gm1", name: "Number System", nameHi: "संख्या पद्धति", completed: false },
          { id: "gm2", name: "Percentage", nameHi: "प्रतिशत", completed: false },
          { id: "gm3", name: "Ratio & Proportion", nameHi: "अनुपात", completed: false },
          { id: "gm4", name: "Average", nameHi: "औसत", completed: false },
          { id: "gm5", name: "Profit and Loss", nameHi: "लाभ और हानि", completed: false },
          { id: "gm6", name: "Time and Work", nameHi: "समय और कार्य", completed: false },
          { id: "gm7", name: "Time Speed Distance", nameHi: "समय चाल दूरी", completed: false },
          { id: "gm8", name: "SI & CI", nameHi: "साधारण एवं चक्रवृद्धि ब्याज", completed: false },
          { id: "gm9", name: "Geometry & Mensuration", nameHi: "ज्यामिति एवं क्षेत्रमिति", completed: false },
        ],
      },
      {
        id: "english-hindi", name: "English / Hindi", nameHi: "अंग्रेजी / हिंदी", icon: "📝",
        topics: [
          { id: "ge1", name: "Error Detection", nameHi: "त्रुटि पहचान", completed: false },
          { id: "ge2", name: "Fill in the Blanks", nameHi: "रिक्त स्थान", completed: false },
          { id: "ge3", name: "Synonyms & Antonyms", nameHi: "पर्यायवाची एवं विलोम", completed: false },
          { id: "ge4", name: "Idioms & Phrases", nameHi: "मुहावरे", completed: false },
          { id: "ge5", name: "Comprehension", nameHi: "गद्यांश", completed: false },
          { id: "ge6", name: "One Word Substitution", nameHi: "एक शब्द प्रतिस्थापन", completed: false },
        ],
      },
      {
        id: "ga", name: "General Awareness", nameHi: "सामान्य जागरूकता", icon: "🌍",
        topics: [
          { id: "gg1", name: "History", nameHi: "इतिहास", completed: false },
          { id: "gg2", name: "Geography", nameHi: "भूगोल", completed: false },
          { id: "gg3", name: "Polity", nameHi: "राजव्यवस्था", completed: false },
          { id: "gg4", name: "Economy", nameHi: "अर्थव्यवस्था", completed: false },
          { id: "gg5", name: "Science", nameHi: "विज्ञान", completed: false },
          { id: "gg6", name: "Current Affairs", nameHi: "करंट अफेयर्स", completed: false },
        ],
      },
    ],
  },
];
