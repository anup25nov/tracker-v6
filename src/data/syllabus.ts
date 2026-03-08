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
            id:"q0",
            name:"Basic Maths",
            nameHi:"मूल गणित",
            completed:false,
            subtopics:[
              { id:"q0-1", name:"Number System", nameHi:"संख्या पद्धति", completed:false },
              { id:"q0-2", name:"Digital Sum", nameHi:"अंक योग", completed:false },
              { id:"q0-3", name:"Divisibility Rule", nameHi:"विभाज्यता नियम", completed:false },
              { id:"q0-4", name:"LCM & HCF", nameHi:"लघुत्तम समापवर्त्य / महत्तम समापवर्त्य", completed:false },
              { id:"q0-5", name:"Simplification / Surds & Indices", nameHi:"सरलीकरण / घातांक", completed:false }, 
            ]
          },
          {
            id:"q1",
            name:"Arithmetic",
            nameHi:"अंकगणित",
            completed:false,
            subtopics:[
              { id:"q1-1", name:"Percentage", nameHi:"प्रतिशत", completed:false },
              { id:"q1-2", name:"Profit & Loss", nameHi:"लाभ और हानि", completed:false },
              { id:"q1-3", name:"Discount", nameHi:"छूट", completed:false },
              { id:"q1-4", name:"Ratio & Proportion", nameHi:"अनुपात एवं समानुपात", completed:false },
              { id:"q1-5", name:"Simple Interest", nameHi:"साधारण ब्याज", completed:false },
              { id:"q1-6", name:"Compound Interest", nameHi:"चक्रवृद्धि ब्याज", completed:false },
              { id:"q1-7", name:"Partnership", nameHi:"साझेदारी", completed:false },
              { id:"q1-8", name:"Average", nameHi:"औसत", completed:false },
              { id:"q1-9", name:"Time & Work", nameHi:"समय और कार्य", completed:false },
              { id:"q1-10", name:"Pipes & Cisterns", nameHi:"पाइप और टंकी", completed:false },
              { id:"q1-11", name:"Time Speed Distance", nameHi:"समय चाल दूरी", completed:false },
              { id:"q1-12", name:"Boats & Streams", nameHi:"नाव और धारा", completed:false },
              { id:"q1-13", name:"Mixture & Alligation", nameHi:"मिश्रण एवं एलिगेशन", completed:false },
              { id:"q1-14", name:"Problems on Ages", nameHi:"आयु संबंधी प्रश्न", completed:false },
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
            { id:"q2-4", name:"Inequalities", nameHi:"असमानताएँ", completed:false },
            { id:"q2-5", name:"Graph of Linear Equations", nameHi:"रेखीय समीकरण का ग्राफ", completed:false }
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
              { id:"q3-4", name:"Circle", nameHi:"वृत्त", completed:false },
              { id:"q3-5", name:"Quadrilaterals", nameHi:"चतुर्भुज", completed:false },
              { id:"q3-6", name:"Polygon Basics", nameHi:"बहुभुज", completed:false }, 

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
              { id:"q4-3", name:"Rhombus", nameHi:"समचतुर्भुज", completed:false },
              { id:"q4-4", name:"Parallelogram", nameHi:"समानांतर चतुर्भुज", completed:false },
              { id:"q4-5", name:"Quadrilateral", nameHi:"चतुर्भुज", completed:false },
              { id:"q4-6", name:"Trapezium", nameHi:"समलंब", completed:false },
              { id:"q4-7", name:"Circle", nameHi:"वृत्त", completed:false },
              { id:"q4-8", name:"Sphere", nameHi:"गोला", completed:false },
              { id:"q4-9", name:"Hemisphere", nameHi:"अर्धगोला", completed:false },
              { id:"q4-10", name:"Cylinder", nameHi:"बेलन", completed:false },
              { id:"q4-11", name:"Cone", nameHi:"शंकु", completed:false },
              { id:"q4-12", name:"Prism", nameHi:"प्रिज्म", completed:false },
              { id:"q4-13", name:"Cuboid (Rectangular Parallelepiped)", nameHi:"घनाभ", completed:false },
              { id:"q4-14", name:"Regular Polygon", nameHi:"नियमित बहुभुज", completed:false },
              { id:"q4-15", name:"Pyramid", nameHi:"पिरामिड", completed:false }
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
                { id:"q5-4", name:"Degree & Radian Measures", nameHi:"डिग्री और रेडियन", completed:false },
                { id:"q5-5", name:"Heights & Distances", nameHi:"ऊँचाई और दूरी", completed:false },
            ]
          },
          
              
          {
            id:"q6",
            name:"Statistics",
            nameHi:"सांख्यिकी",
            completed:false,
            subtopics:[
              { id:"q6-1", name:"Mean", nameHi:"माध्य", completed:false },
              { id:"q6-2", name:"Median", nameHi:"मध्यिका", completed:false },
              { id:"q6-3", name:"Mode", nameHi:"बहुलक", completed:false },
              { id:"q6-4", name:"Standard Deviation", nameHi:"मानक विचलन", completed:false },
              { id:"q6-5", name:"Histogram", nameHi:"हिस्टोग्राम", completed:false },
              { id:"q6-6", name:"Frequency Polygon", nameHi:"फ्रीक्वेंसी पॉलीगॉन", completed:false },
              { id:"q6-7", name:"Probability", nameHi:"प्रायिकता", completed:false }
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
              { id:"r1-15", name:"Decision Making", nameHi:"निर्णय लेना", completed:false },
              { id:"r1-16", name:"Similarities & Differences", nameHi:"समानताएँ और अंतर", completed:false },
              { id:"r1-17", name:"Observation", nameHi:"अवलोकन", completed:false },
              { id:"r1-18", name:"Problem Solving", nameHi:"समस्या समाधान", completed:false },
              { id:"r1-19", name:"Judgment", nameHi:"निर्णय क्षमता", completed:false }
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
              { id:"r2-4", name:"Puzzle / Seating Arrangement", nameHi:"पहेली / बैठक व्यवस्था", completed:false },
              { id:"r2-5", name:"Number Analogy", nameHi:"संख्या सादृश्यता", completed:false },
              { id:"r2-6", name:"Symbolic Operations", nameHi:"प्रतीकात्मक संक्रियाएँ", completed:false }
            ]
          },
          
          // NEW TOPIC
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
              { id:"r3-9", name:"Pattern Folding", nameHi:"पैटर्न मोड़ना", completed:false },
              { id:"r3-10", name:"Figural Classification", nameHi:"आकृति वर्गीकरण", completed:false },
              { id:"r3-11", name:"Figural Analogy", nameHi:"आकृति सादृश्यता", completed:false }
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
              { id:"e1-8", name:"Subject Verb Agreement", nameHi:"कर्ता क्रिया सामंजस्य", completed:false },
              { id:"e1-9", name:"Adjectives", nameHi:"विशेषण", completed:false },
              { id:"e1-10", name:"Adverbs", nameHi:"क्रिया विशेषण", completed:false }
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
              { id:"e2-5", name:"Spelling Correction", nameHi:"वर्तनी सुधार", completed:false },
              { id:"e2-6", name:"Homonyms", nameHi:"समरूपी शब्द", completed:false }
            ]
            },
            
            {
              id:"e3",
              name:"Sentence Usage",
              nameHi:"वाक्य प्रयोग",
              completed:false,
              subtopics:[
                { id:"e3-1", name:"Spotting Errors", nameHi:"त्रुटि पहचान", completed:false },
                { id:"e3-2", name:"Fill in the Blanks", nameHi:"रिक्त स्थान भरें", completed:false },
                { id:"e3-3", name:"Para Jumbles", nameHi:"पैराग्राफ क्रम", completed:false }
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
              id: "ga",
              name: "General Awareness (GK)",
              nameHi: "सामान्य जागरूकता (जीके)",
              icon: "🌍",
              topics: [
                {
                  id: "ga-ancient",
                  name: "Ancient History",
                  nameHi: "प्राचीन इतिहास",
                  completed: false,
                  subtopics: [
                    { id: "t1-1", name: "Stone Age", nameHi: "पत्थर युग", completed: false },
                    { id: "t1-2", name: "Indus Valley Civilization", nameHi: "सिंधु घाटी सभ्यता", completed: false },
                    { id: "t1-3", name: "Vedic Age", nameHi: "वैदिक काल", completed: false },
                    { id: "t1-4", name: "Jainism", nameHi: "जैन धर्म", completed: false },
                    { id: "t1-5", name: "Buddhism", nameHi: "बौद्ध धर्म", completed: false },
                    { id: "t1-6", name: "Mahajanapadas", nameHi: "महाजनपद", completed: false },
                    { id: "t1-7", name: "Persian & Greek Invasion", nameHi: "फारसी और यूनानी आक्रमण", completed: false },
                    { id: "t1-8", name: "Mauryan Empire", nameHi: "मौर्य साम्राज्य", completed: false },
                    { id: "t1-9", name: "Post-Mauryan Period", nameHi: "मौर्योत्तर काल", completed: false },
                    { id: "t1-10", name: "Sangam Age", nameHi: "संगम काल", completed: false },
                    { id: "t1-11", name: "Gupta Empire", nameHi: "गुप्त साम्राज्य", completed: false },
                    { id: "t1-12", name: "Post-Gupta Period", nameHi: "गुप्तोत्तर काल", completed: false },
                  ],
                },
                {
                  id: "ga-medieval",
                  name: "Medieval History",
                  nameHi: "मध्यकालीन इतिहास",
                  completed: false,
                  subtopics: [
                    { id: "t2-1", name: "Early Medieval India", nameHi: "प्रारंभिक मध्यकालीन भारत", completed: false },
                    { id: "t2-2", name: "Rajput Period", nameHi: "राजपूत काल", completed: false },
                    { id: "t2-3", name: "Arab & Turkish Invasion", nameHi: "अरब और तुर्क आक्रमण", completed: false },
                    { id: "t2-4", name: "Delhi Sultanate", nameHi: "दिल्ली सल्तनत", completed: false },
                    { id: "t2-5", name: "Vijayanagara Empire", nameHi: "विजयनगर साम्राज्य", completed: false },
                    { id: "t2-6", name: "Bahmani Kingdom", nameHi: "बहमनी साम्राज्य", completed: false },
                    { id: "t2-7", name: "Mughal Empire", nameHi: "मुगल साम्राज्य", completed: false },
                    { id: "t2-8", name: "Maratha Empire", nameHi: "मराठा साम्राज्य", completed: false },
                    { id: "t2-9", name: "Bhakti Movement", nameHi: "भक्ति आंदोलन", completed: false },
                    { id: "t2-10", name: "Sufi Movement", nameHi: "सूफी आंदोलन", completed: false },
                    { id: "t2-11", name: "Medieval Art & Architecture", nameHi: "मध्यकालीन कला एवं स्थापत्य", completed: false },
                    { id: "t2-12", name: "Medieval Literature", nameHi: "मध्यकालीन साहित्य", completed: false },
                  ],
                },
                {
                  id: "ga-modern",
                  name: "Modern History",
                  nameHi: "आधुनिक इतिहास",
                  completed: false,
                  subtopics: [
                    { id: "t3-1", name: "Advent of Europeans in India", nameHi: "भारत में यूरोपियों का आगमन", completed: false },
                    { id: "t3-2", name: "British Expansion in India", nameHi: "भारत में ब्रिटिश विस्तार", completed: false },
                    { id: "t3-3", name: "Carnatic Wars", nameHi: "कर्नाटक युद्ध", completed: false },
                    { id: "t3-4", name: "Anglo-Mysore Wars", nameHi: "आंग्ल-मैसूर युद्ध", completed: false },
                    { id: "t3-5", name: "Anglo-Maratha Wars", nameHi: "आंग्ल-मराठा युद्ध", completed: false },
                    { id: "t3-6", name: "Anglo-Sikh Wars", nameHi: "आंग्ल-सिख युद्ध", completed: false },
                    { id: "t3-7", name: "Revolt of 1857", nameHi: "1857 का विद्रोह", completed: false },
                    { id: "t3-8", name: "Social & Religious Reform Movements", nameHi: "सामाजिक एवं धार्मिक सुधार आंदोलन", completed: false },
                    { id: "t3-9", name: "Tribal & Peasant Movements", nameHi: "जनजातीय और किसान आंदोलन", completed: false },
                    { id: "t3-10", name: "Indian National Movement", nameHi: "भारतीय राष्ट्रीय आंदोलन", completed: false },
                    { id: "t3-11", name: "Moderates Phase", nameHi: "उदारवादी चरण", completed: false },
                    { id: "t3-12", name: "Extremists Phase", nameHi: "गरम दल चरण", completed: false },
                    { id: "t3-13", name: "Revolutionary Movements", nameHi: "क्रांतिकारी आंदोलन", completed: false },
                    { id: "t3-14", name: "Gandhian Era", nameHi: "गांधी युग", completed: false },
                    { id: "t3-15", name: "Constitutional Developments", nameHi: "संवैधानिक विकास", completed: false },
                    { id: "t3-16", name: "Partition of India", nameHi: "भारत का विभाजन", completed: false },
                    { id: "t3-17", name: "Independence of India", nameHi: "भारत की स्वतंत्रता", completed: false },
                  ],
                },
                {
                  id: "ga-geography",
                  name: "Geography",
                  nameHi: "भूगोल",
                  completed: false,
                  subtopics: [
                    { id: "ga-geo-1", name: "World Geography", nameHi: "विश्व भूगोल", completed: false },
                    { id: "ga-geo-2", name: "India Physical", nameHi: "भारत भौतिक", completed: false },
                    { id: "ga-geo-3", name: "India Political Map", nameHi: "भारत राजनीतिक मानचित्र", completed: false },
                    { id: "ga-geo-4", name: "Rivers & Lakes", nameHi: "नदियाँ और झीलें", completed: false },
                    { id: "ga-geo-5", name: "Climate & Monsoon", nameHi: "जलवायु और मानसून", completed: false },
                    { id: "ga-geo-6", name: "Soil & Vegetation", nameHi: "मृदा और वनस्पति", completed: false },
                    { id: "ga-geo-7", name: "Agriculture", nameHi: "कृषि", completed: false },
                    { id: "ga-geo-8", name: "Mineral Resources", nameHi: "खनिज संसाधन", completed: false },
                    { id: "ga-geo-9", name: "Industries", nameHi: "उद्योग", completed: false },
                    { id: "ga-geo-10", name: "Transport & Communication", nameHi: "परिवहन और संचार", completed: false },
                    { id: "ga-geo-11", name: "Population", nameHi: "जनसंख्या", completed: false },
                    { id: "ga-geo-12", name: "World Organisations & Places", nameHi: "विश्व संगठन और स्थान", completed: false },
                  ],
                },
                {
                  id: "ga-polity",
                  name: "Polity",
                  nameHi: "राजव्यवस्था",
                  completed: false,
                  subtopics: [
                      { id: "ga-pol-1", name: "Indian Constitution & its Sources", nameHi: "भारतीय संविधान एवं उसके स्रोत", completed: false },
                      { id: "ga-pol-2", name: "Preamble & Schedules", nameHi: "प्रस्तावना एवं अनुसूचियाँ", completed: false },
                      { id: "ga-pol-3", name: "Citizenship", nameHi: "नागरिकता", completed: false },
                      { id: "ga-pol-4", name: "Fundamental Rights", nameHi: "मौलिक अधिकार", completed: false },
                      { id: "ga-pol-5", name: "Directive Principles", nameHi: "निर्देशक सिद्धांत", completed: false },
                      { id: "ga-pol-6", name: "Fundamental Duties", nameHi: "मौलिक कर्तव्य", completed: false },
                      { id: "ga-pol-7", name: "Union Executive", nameHi: "केंद्रीय कार्यपालिका", completed: false },
                      { id: "ga-pol-8", name: "President & Vice President", nameHi: "राष्ट्रपति और उपराष्ट्रपति", completed: false },
                      { id: "ga-pol-9", name: "Prime Minister & Council of Ministers", nameHi: "प्रधानमंत्री और मंत्रिपरिषद", completed: false },
                      { id: "ga-pol-10", name: "Parliament", nameHi: "संसद", completed: false },
                      { id: "ga-pol-11", name: "Judiciary", nameHi: "न्यायपालिका", completed: false },
                      { id: "ga-pol-14", name: "Supreme Court & High Courts", nameHi: "सुप्रीम कोर्ट और उच्च न्यायालय", completed: false },
                      { id: "ga-pol-15", name: "Writs", nameHi: "रिट", completed: false },
                      { id: "ga-pol-12", name: "State Executive & Legislature", nameHi: "राज्य कार्यपालिका और विधानमंडल", completed: false },
                      { id: "ga-pol-13", name: "Governors & Chief Ministers", nameHi: "राज्यपाल और मुख्यमंत्री", completed: false },
                      { id: "ga-pol-14", name: "State Assemblies & Legislative Councils", nameHi: "राज्य विधानसभा और विधान परिषद", completed: false },
                      { id: "ga-pol-15", name: "Centre-State Relations", nameHi: "केंद्र-राज्य संबंध", completed: false },
                      { id: "ga-pol-16", name: "Union Territories", nameHi: "केंद्र शासित प्रदेश", completed: false },
                      { id: "ga-pol-17", name: "Local Government & Panchayati Raj", nameHi: "स्थानीय स्वशासन और पंचायती राज", completed: false },
                      { id: "ga-pol-18", name: "Constitutional Bodies", nameHi: "संवैधानिक निकाय", completed: false },
                      { id: "ga-pol-19", name: "Election Commission & Elections", nameHi: "चुनाव आयोग और चुनाव", completed: false },
                      { id: "ga-pol-20", name: "Amendment of Constitution", nameHi: "संविधान संशोधन", completed: false },
                      { id: "ga-pol-21", name: "Emergency Provisions", nameHi: "आपातकालीन प्रावधान", completed: false },
                  ],
                },
                {
                  id: "ga-economy",
                  name: "Economy",
                  nameHi: "अर्थव्यवस्था",
                  completed: false,
                  subtopics: [
                    { id: "ga-eco-1", name: "Indian Economy", nameHi: "भारतीय अर्थव्यवस्था", completed: false },
                    { id: "ga-eco-2", name: "Planning & NITI Aayog", nameHi: "योजना और नीति आयोग", completed: false },
                    { id: "ga-eco-3", name: "Budget & Fiscal Policy", nameHi: "बजट और राजकोषीय नीति", completed: false },
                    { id: "ga-eco-4", name: "Banking System", nameHi: "बैंकिंग व्यवस्था", completed: false },
                    { id: "ga-eco-5", name: "RBI & Monetary Policy", nameHi: "आरबीआई और मौद्रिक नीति", completed: false },
                    { id: "ga-eco-6", name: "Taxation", nameHi: "कराधान", completed: false },
                    { id: "ga-eco-7", name: "Agriculture & Rural Development", nameHi: "कृषि और ग्रामीण विकास", completed: false },
                    { id: "ga-eco-8", name: "Industry & Infrastructure", nameHi: "उद्योग और अवसंरचना", completed: false },
                    { id: "ga-eco-9", name: "Foreign Trade", nameHi: "विदेशी व्यापार", completed: false },
                    { id: "ga-eco-10", name: "Poverty & Unemployment", nameHi: "गरीबी और बेरोजगारी", completed: false },
                    { id: "ga-eco-11", name: "Economic Reforms", nameHi: "आर्थिक सुधार", completed: false },
                  ],
                },
                {
                  id: "ga-physics",
                  name: "Physics",
                  nameHi: "भौतिकी",
                  completed: false,
                  subtopics: [
                    { id: "t7-1", name: "Motion", nameHi: "गति", completed: false },
                    { id: "t7-2", name: "Laws of Motion", nameHi: "गति के नियम", completed: false },
                    { id: "t7-3", name: "Work Energy Power", nameHi: "कार्य ऊर्जा शक्ति", completed: false },
                    { id: "t7-4", name: "Gravitation", nameHi: "गुरुत्वाकर्षण", completed: false },
                    { id: "t7-5", name: "Pressure", nameHi: "दाब", completed: false },
                    { id: "t7-6", name: "Heat & Temperature", nameHi: "ऊष्मा और तापमान", completed: false },
                    { id: "t7-7", name: "Thermodynamics", nameHi: "ऊष्मागतिकी", completed: false },
                    { id: "t7-8", name: "Waves", nameHi: "तरंगें", completed: false },
                    { id: "t7-9", name: "Sound", nameHi: "ध्वनि", completed: false },
                    { id: "t7-10", name: "Light", nameHi: "प्रकाश", completed: false },
                    { id: "t7-11", name: "Reflection of Light", nameHi: "प्रकाश का परावर्तन", completed: false },
                    { id: "t7-12", name: "Refraction of Light", nameHi: "प्रकाश का अपवर्तन", completed: false },
                    { id: "t7-13", name: "Electricity", nameHi: "विद्युत", completed: false },
                    { id: "t7-14", name: "Magnetism", nameHi: "चुंबकत्व", completed: false },
                    { id: "t7-15", name: "Modern Physics", nameHi: "आधुनिक भौतिकी", completed: false },
                  ],
                },
                {
                  id: "ga-chemistry",
                  name: "Chemistry",
                  nameHi: "रसायन विज्ञान",
                  completed: false,
                  subtopics: [
                    { id: "t8-1", name: "Matter", nameHi: "पदार्थ", completed: false },
                    { id: "t8-2", name: "States of Matter", nameHi: "पदार्थ की अवस्थाएँ", completed: false },
                    { id: "t8-3", name: "Atomic Structure", nameHi: "परमाणु संरचना", completed: false },
                    { id: "t8-4", name: "Chemical Bonding", nameHi: "रासायनिक बंध", completed: false },
                    { id: "t8-5", name: "Periodic Table", nameHi: "आवर्त सारणी", completed: false },
                    { id: "t8-6", name: "Chemical Reactions", nameHi: "रासायनिक अभिक्रियाएँ", completed: false },
                    { id: "t8-7", name: "Acids Bases Salts", nameHi: "अम्ल क्षार लवण", completed: false },
                    { id: "t8-8", name: "Metals & Non-metals", nameHi: "धातु और अधातु", completed: false },
                    { id: "t8-9", name: "Carbon & Its Compounds", nameHi: "कार्बन और उसके यौगिक", completed: false },
                    { id: "t8-10", name: "Hydrocarbons", nameHi: "हाइड्रोकार्बन", completed: false },
                    { id: "t8-11", name: "Environmental Chemistry", nameHi: "पर्यावरण रसायन", completed: false },
                    { id: "t8-12", name: "Nuclear Chemistry", nameHi: "नाभिकीय रसायन", completed: false },
                  ],
                },
                {
                  id: "ga-biology",
                  name: "Biology",
                  nameHi: "जीवविज्ञान",
                  completed: false,
                  subtopics: [
                    { id: "t9-1", name: "Cell Biology", nameHi: "कोशिका विज्ञान", completed: false },
                    { id: "t9-2", name: "Cell Organelles", nameHi: "कोशिका अंग", completed: false },
                    { id: "t9-3", name: "Cell Division", nameHi: "कोशिका विभाजन", completed: false },
                    { id: "t9-4", name: "Plant Tissue", nameHi: "पादप ऊतक", completed: false },
                    { id: "t9-5", name: "Animal Tissue", nameHi: "पशु ऊतक", completed: false },
                    { id: "t9-6", name: "Plant Physiology", nameHi: "पादप शरीर क्रिया विज्ञान", completed: false },
                    { id: "t9-7", name: "Human Physiology", nameHi: "मानव शरीर क्रिया विज्ञान", completed: false },
                    { id: "t9-8", name: "Genetics", nameHi: "आनुवंशिकी", completed: false },
                    { id: "t9-9", name: "Evolution", nameHi: "विकासवाद", completed: false },
                    { id: "t9-10", name: "Ecology", nameHi: "पारिस्थितिकी", completed: false },
                    { id: "t9-11", name: "Diseases", nameHi: "रोग", completed: false },
                    { id: "t9-12", name: "Nutrition", nameHi: "पोषण", completed: false },
                    { id: "t9-13", name: "Reproduction", nameHi: "प्रजनन", completed: false },
                    { id: "t9-14", name: "Biotechnology", nameHi: "जैव प्रौद्योगिकी", completed: false },
                  ],
                },
                {
                  id: "ga-static",
                  name: "Static GK",
                  nameHi: "स्थैतिक सामान्य ज्ञान",
                  completed: false,
                  subtopics: [
                    { id: "t10-1", name: "Classical Dances", nameHi: "शास्त्रीय नृत्य", completed: false },
                    { id: "t10-2", name: "Folk Dances", nameHi: "लोक नृत्य", completed: false },
                    { id: "t10-3", name: "Indian Music", nameHi: "भारतीय संगीत", completed: false },
                    { id: "t10-4", name: "Art & Culture", nameHi: "कला और संस्कृति", completed: false },
                    { id: "t10-5", name: "Architecture", nameHi: "वास्तुकला", completed: false },
                    { id: "t10-6", name: "Books & Authors", nameHi: "पुस्तकें और लेखक", completed: false },
                    { id: "t10-7", name: "Awards & Honours", nameHi: "पुरस्कार और सम्मान", completed: false },
                    { id: "t10-8", name: "Important Days", nameHi: "महत्वपूर्ण दिवस", completed: false },
                    { id: "t10-9", name: "Sports", nameHi: "खेल", completed: false },
                    { id: "t10-10", name: "National Parks", nameHi: "राष्ट्रीय उद्यान", completed: false },
                    { id: "t10-11", name: "International Organizations", nameHi: "अंतरराष्ट्रीय संगठन", completed: false },
                  ],
                },
                {
                  id: "ga-current",
                  name: "Current Affairs",
                  nameHi: "समसामयिक घटनाएँ",
                  completed: false,
                  subtopics: [
                    { id: "t11-1", name: "National News", nameHi: "राष्ट्रीय समाचार", completed: false },
                    { id: "t11-2", name: "International News", nameHi: "अंतरराष्ट्रीय समाचार", completed: false },
                    { id: "t11-3", name: "Government Schemes", nameHi: "सरकारी योजनाएँ", completed: false },
                    { id: "t11-4", name: "Economy Updates", nameHi: "अर्थव्यवस्था अपडेट", completed: false },
                    { id: "t11-5", name: "Science & Technology", nameHi: "विज्ञान और प्रौद्योगिकी", completed: false },
                    { id: "t11-6", name: "Awards & Sports", nameHi: "पुरस्कार और खेल", completed: false },
                    { id: "t11-7", name: "Reports & Indexes", nameHi: "रिपोर्ट और सूचकांक", completed: false },
                  ],
                },
              ],
            },
      ],
  },
  {
    id: "railway",
    name: "Railway",
    nameHi: "रेलवे",
    description: "RRB NTPC, Group D & more",
    descriptionHi: "आरआरबी एनटीपीसी, ग्रुप डी और अन्य",
    icon: "🚂",
    color: "25 95% 53%",
    subjects: [],
  },
  {
    id: "bank",
    name: "Bank",
    nameHi: "बैंक",
    description: "IBPS, SBI & other bank exams",
    descriptionHi: "आईबीपीएस, एसबीआई और अन्य बैंक परीक्षाएं",
    icon: "🏦",
    color: "262 83% 58%",
    subjects: [],
  },
];
