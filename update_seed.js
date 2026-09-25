const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

const techQuestions = [
  { text: 'What is the output of `typeof null` in JavaScript?', options: ['"undefined"', '"object"', '"null"', '"string"'], correct: '"object"', skill: 'JavaScript' },
  { text: 'Which SQL clause is used to filter grouped results?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correct: 'HAVING', skill: 'SQL' },
  { text: 'Which data structure follows LIFO?', options: ['Queue', 'Tree', 'Stack', 'Graph'], correct: 'Stack', skill: 'Data Structures' },
  { text: 'What HTTP method is typically used to update an existing resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], correct: 'PUT', skill: 'REST APIs' },
  { text: 'Which git command is used to save your changes without committing?', options: ['git save', 'git stash', 'git push', 'git hold'], correct: 'git stash', skill: 'Git' },
  { text: 'What is the main purpose of Docker?', options: ['Database management', 'Containerization', 'Version control', 'UI design'], correct: 'Containerization', skill: 'Docker' },
  { text: 'Which tag is used to create a hyperlink in HTML?', options: ['<link>', '<a>', '<href>', '<hyper>'], correct: '<a>', skill: 'HTML' },
  { text: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'], correct: 'Cascading Style Sheets', skill: 'CSS' },
  { text: 'In React, what hook is used to manage state?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], correct: 'useState', skill: 'React' },
  { text: 'What is the time complexity of binary search?', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(log n)'], correct: 'O(log n)', skill: 'Data Structures' },
  { text: 'Which of these is a NoSQL database?', options: ['PostgreSQL', 'MySQL', 'MongoDB', 'Oracle'], correct: 'MongoDB', skill: 'MongoDB' },
  { text: 'What does API stand for?', options: ['Application Programming Interface', 'Advanced Programming Interface', 'Application Process Integration', 'Automated Program Interface'], correct: 'Application Programming Interface', skill: 'REST APIs' },
  { text: 'Which language is primarily used for Android app development?', options: ['Swift', 'Kotlin', 'Objective-C', 'Ruby'], correct: 'Kotlin', skill: 'Android' },
  { text: 'What is a closure in JavaScript?', options: ['A function bundled with its lexical environment', 'A way to close the browser', 'A method to end a loop', 'A variable type'], correct: 'A function bundled with its lexical environment', skill: 'JavaScript' },
  { text: 'Which SQL statement is used to extract data from a database?', options: ['EXTRACT', 'PULL', 'SELECT', 'GET'], correct: 'SELECT', skill: 'SQL' },
  { text: 'What does AWS stand for?', options: ['Amazon Web Services', 'Advanced Web Solutions', 'Automated Web Server', 'Application Web System'], correct: 'Amazon Web Services', skill: 'AWS' },
  { text: 'In Python, how do you create a function?', options: ['function my_func():', 'def my_func():', 'create my_func():', 'fn my_func():'], correct: 'def my_func():', skill: 'Python' },
  { text: 'Which sorting algorithm has the worst-case time complexity of O(n^2)?', options: ['Merge Sort', 'Heap Sort', 'Bubble Sort', 'Radix Sort'], correct: 'Bubble Sort', skill: 'Data Structures' },
  { text: 'What is the default port for HTTP?', options: ['443', '21', '8080', '80'], correct: '80', skill: 'Networking' },
  { text: 'Which keyword is used to handle exceptions in Java?', options: ['try-catch', 'handle-error', 'if-else', 'switch'], correct: 'try-catch', skill: 'Java' },
  { text: 'What is the purpose of a foreign key in SQL?', options: ['To encrypt data', 'To link two tables together', 'To generate primary keys', 'To delete records'], correct: 'To link two tables together', skill: 'SQL' },
  { text: 'Which of the following is NOT a JavaScript framework/library?', options: ['Vue', 'Angular', 'Django', 'React'], correct: 'Django', skill: 'JavaScript' },
  { text: 'What does MVC stand for?', options: ['Model View Controller', 'Main Visual Component', 'Multiple View Configuration', 'Model Visual Control'], correct: 'Model View Controller', skill: 'Architecture' },
  { text: 'In Git, what does `git clone` do?', options: ['Creates a new branch', 'Copies an existing repository', 'Deletes a repository', 'Merges two branches'], correct: 'Copies an existing repository', skill: 'Git' },
  { text: 'Which format is commonly used for data exchange in APIs?', options: ['XML', 'JSON', 'CSV', 'YAML'], correct: 'JSON', skill: 'REST APIs' },
  { text: 'What is Node.js?', options: ['A frontend framework', 'A JavaScript runtime', 'A database', 'A styling language'], correct: 'A JavaScript runtime', skill: 'Node.js' },
  { text: 'Which of these is a statically typed language?', options: ['Python', 'JavaScript', 'Ruby', 'TypeScript'], correct: 'TypeScript', skill: 'TypeScript' },
  { text: 'What does CI/CD stand for?', options: ['Continuous Integration / Continuous Deployment', 'Code Integration / Code Delivery', 'Continuous Improvement / Code Deployment', 'Centralized Integration / Centralized Delivery'], correct: 'Continuous Integration / Continuous Deployment', skill: 'DevOps' },
  { text: 'In object-oriented programming, what is inheritance?', options: ['Hiding implementation details', 'Creating new classes based on existing ones', 'Bundling data and methods', 'Multiple functions with the same name'], correct: 'Creating new classes based on existing ones', skill: 'Programming Concepts' },
  { text: 'Which command is used to install packages in Node.js?', options: ['npm install', 'pip install', 'gem install', 'apt-get install'], correct: 'npm install', skill: 'Node.js' }
];

let questionsString = techQuestions.map(q => `          {
            questionText: ${JSON.stringify(q.text)},
            options: JSON.stringify(${JSON.stringify(q.options)}),
            correctAnswer: ${JSON.stringify(q.correct)},
            skillName: ${JSON.stringify(q.skill)},
            difficulty: 'MEDIUM',
            marks: 1
          }`).join(',\n');

// Use regex to replace the assessments array
const newAssessments = `[
      {
        title: 'Technical Skills Assessment',
        description: 'Test your fundamental programming and computer science knowledge.',
        type: 'TECHNICAL',
        durationMinutes: 30,
        isPublished: true,
        questions: [
${questionsString}
        ]
      },
      {
        title: 'Soft Skills Assessment',
        description: 'Evaluate your workplace communication and problem-solving skills.',
        type: 'SOFT_SKILL',
        durationMinutes: 30,
        isPublished: true,
        questions: [
          {
            questionText: 'When a team member disagrees with your approach, what is the best first step?',
            options: JSON.stringify(['Ignore them', 'Argue your point harder', 'Listen to their perspective', 'Escalate to manager']),
            correctAnswer: 'Listen to their perspective',
            difficulty: 'MEDIUM',
            marks: 5
          }
        ]
      },
      {
        title: 'Aptitude Assessment',
        description: 'Test your logical reasoning and quantitative aptitude.',
        type: 'APTITUDE',
        durationMinutes: 30,
        isPublished: true,
        questions: [
          {
            questionText: 'If a train travels 60km in 45 minutes, what is its speed in km/h?',
            options: JSON.stringify(['75 km/h', '80 km/h', '90 km/h', '100 km/h']),
            correctAnswer: '80 km/h',
            difficulty: 'MEDIUM',
            marks: 5
          }
        ]
      }
    ]`;

content = content.replace(/const assessments = \[\s*\{[\s\S]*?\}\s*\];/, `const assessments = ${newAssessments};`);

fs.writeFileSync(seedPath, content);
console.log('Seed updated!');
