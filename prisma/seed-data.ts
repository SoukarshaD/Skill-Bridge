// Exported demo data for seed script

export const skills = [
    { name: 'Python', category: 'Programming Language', domain: 'Computer Science' },
    { name: 'SQL', category: 'Database', domain: 'Computer Science' },
    { name: 'JavaScript', category: 'Programming Language', domain: 'Computer Science' },
    { name: 'TypeScript', category: 'Programming Language', domain: 'Computer Science' },
    { name: 'React', category: 'Frontend Framework', domain: 'Computer Science' },
    { name: 'Node.js', category: 'Backend Framework', domain: 'Computer Science' },
    { name: 'Express', category: 'Backend Framework', domain: 'Computer Science' },
    { name: 'PostgreSQL', category: 'Database', domain: 'Computer Science' },
    { name: 'MongoDB', category: 'Database', domain: 'Computer Science' },
    { name: 'Git', category: 'Version Control', domain: 'Computer Science' },
    { name: 'HTML', category: 'Frontend', domain: 'Computer Science' },
    { name: 'CSS', category: 'Frontend', domain: 'Computer Science' },
    { name: 'Java', category: 'Programming Language', domain: 'Computer Science' },
    { name: 'C++', category: 'Programming Language', domain: 'Computer Science' },
    { name: 'C', category: 'Programming Language', domain: 'Computer Science' },
    { name: 'REST APIs', category: 'Backend', domain: 'Computer Science' },
    { name: 'Docker', category: 'DevOps', domain: 'Computer Science' },
    { name: 'AWS', category: 'Cloud', domain: 'Computer Science' },
    { name: 'Machine Learning', category: 'AI', domain: 'Data Science' },
    { name: 'Data Structures', category: 'Core CS', domain: 'Computer Science' },
    { name: 'Algorithms', category: 'Core CS', domain: 'Computer Science' },
  ];

export const opps = [
      {
        title: 'Software Engineering Intern',
        description: 'Join our team to build scalable web applications.',
        type: 'INTERNSHIP',
        status: 'PUBLISHED',
        location: 'Mountain View, CA',
        workMode: 'HYBRID',
        compensation: '$8,000/month',
        duration: '3 months',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        skills: ['SQL', 'JavaScript']
      },
      {
        title: 'Machine Learning Researcher',
        description: 'Collaborate with academicians and students on cutting edge ML models.',
        type: 'RESEARCH_COLLABORATION',
        status: 'PUBLISHED',
        location: 'Remote',
        workMode: 'REMOTE',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        skills: ['Python', 'Machine Learning']
      },
      {
        title: 'Frontend Developer Intern',
        description: 'Design and build intuitive user interfaces using modern web frameworks.',
        type: 'INTERNSHIP',
        status: 'PUBLISHED',
        location: 'New York, NY',
        workMode: 'HYBRID',
        compensation: '$7,000/month',
        duration: '6 months',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        skills: ['React', 'TypeScript', 'CSS', 'HTML']
      },
      {
        title: 'Data Science Intern',
        description: 'Analyze large datasets to extract meaningful business insights.',
        type: 'INTERNSHIP',
        status: 'PUBLISHED',
        location: 'Remote',
        workMode: 'REMOTE',
        compensation: '$7,500/month',
        duration: '4 months',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        skills: ['Python', 'Data Structures', 'SQL']
      },
      {
        title: 'Backend Developer Intern',
        description: 'Build robust REST APIs and manage highly available databases.',
        type: 'INTERNSHIP',
        status: 'PUBLISHED',
        location: 'Austin, TX',
        workMode: 'ONSITE',
        compensation: '$8,200/month',
        duration: '3 months',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        skills: ['Node.js', 'Express', 'PostgreSQL', 'REST APIs']
      },
      {
        title: 'DevOps Engineer Intern',
        description: 'Automate deployments and manage cloud infrastructure.',
        type: 'INTERNSHIP',
        status: 'PUBLISHED',
        location: 'Seattle, WA',
        workMode: 'HYBRID',
        compensation: '$8,500/month',
        duration: '6 months',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        skills: ['Docker', 'AWS', 'Git']
      },
      {
        title: 'Mobile App Developer Intern',
        description: 'Develop cross-platform mobile applications for millions of users.',
        type: 'INTERNSHIP',
        status: 'PUBLISHED',
        location: 'Remote',
        workMode: 'REMOTE',
        compensation: '$7,200/month',
        duration: '3 months',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        skills: ['React', 'JavaScript', 'Java']
      },
      {
        title: 'Core CS Researcher',
        description: 'Research advanced algorithms and data structures.',
        type: 'RESEARCH_COLLABORATION',
        status: 'PUBLISHED',
        location: 'Boston, MA',
        workMode: 'HYBRID',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        skills: ['Algorithms', 'Data Structures', 'C++']
      }
    ];

export const resources = [
      {
        title: 'React Crash Course 2026',
        provider: 'SkillBridge Academy',
        description: 'Master React, Hooks, and Next.js in this comprehensive crash course.',
        url: 'https://react.dev/learn',
        duration: '10 hours',
        type: 'COURSE',
        skills: [{ name: 'React', level: 4 }, { name: 'JavaScript', level: 3 }]
      },
      {
        title: 'Advanced SQL Masterclass',
        provider: 'DataCamp',
        description: 'Learn complex joins, window functions, and query optimization.',
        url: 'https://www.datacamp.com/',
        duration: '15 hours',
        type: 'COURSE',
        skills: [{ name: 'SQL', level: 4 }, { name: 'PostgreSQL', level: 4 }]
      },
      {
        title: 'Machine Learning A-Z',
        provider: 'Coursera',
        description: 'Complete guide to Machine Learning using Python.',
        url: 'https://www.coursera.org/',
        duration: '40 hours',
        type: 'CERTIFICATION',
        skills: [{ name: 'Python', level: 5 }, { name: 'Machine Learning', level: 4 }]
      },
      {
        title: 'Docker for Beginners',
        provider: 'Udemy',
        description: 'Containerize your applications with Docker and deploy them easily.',
        url: 'https://www.udemy.com/',
        duration: '5 hours',
        type: 'WORKSHOP',
        skills: [{ name: 'Docker', level: 3 }, { name: 'DevOps', level: 2 }]
      },
      {
        title: 'Data Structures and Algorithms in C++',
        provider: 'edX',
        description: 'Deep dive into competitive programming and core computer science concepts.',
        url: 'https://www.edx.org/',
        duration: '30 hours',
        type: 'COURSE',
        skills: [{ name: 'Algorithms', level: 5 }, { name: 'Data Structures', level: 5 }, { name: 'C++', level: 4 }]
      },
      {
        title: 'Complete Node.js Developer',
        provider: 'Zero To Mastery',
        description: 'Learn to build scalable backend applications with Express and Node.',
        url: 'https://zerotomastery.io/',
        duration: '20 hours',
        type: 'COURSE',
        skills: [{ name: 'Node.js', level: 4 }, { name: 'Express', level: 4 }, { name: 'REST APIs', level: 3 }]
      }
    ];

export const assessments = [
      {
        title: 'Technical Skills Assessment',
        description: 'Test your fundamental programming and computer science knowledge.',
        type: 'TECHNICAL',
        durationMinutes: 30,
        isPublished: true,
        questions: [
          {
            questionText: "What is the output of `typeof null` in JavaScript?",
            options: JSON.stringify(["\"undefined\"","\"object\"","\"null\"","\"string\""]),
            correctAnswer: "\"object\"",
            skillName: "JavaScript",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which SQL clause is used to filter grouped results?",
            options: JSON.stringify(["WHERE","HAVING","GROUP BY","ORDER BY"]),
            correctAnswer: "HAVING",
            skillName: "SQL",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which data structure follows LIFO?",
            options: JSON.stringify(["Queue","Tree","Stack","Graph"]),
            correctAnswer: "Stack",
            skillName: "Data Structures",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What HTTP method is typically used to update an existing resource?",
            options: JSON.stringify(["GET","POST","PUT","DELETE"]),
            correctAnswer: "PUT",
            skillName: "REST APIs",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which git command is used to save your changes without committing?",
            options: JSON.stringify(["git save","git stash","git push","git hold"]),
            correctAnswer: "git stash",
            skillName: "Git",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What is the main purpose of Docker?",
            options: JSON.stringify(["Database management","Containerization","Version control","UI design"]),
            correctAnswer: "Containerization",
            skillName: "Docker",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which tag is used to create a hyperlink in HTML?",
            options: JSON.stringify(["<link>","<a>","<href>","<hyper>"]),
            correctAnswer: "<a>",
            skillName: "HTML",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What does CSS stand for?",
            options: JSON.stringify(["Computer Style Sheets","Cascading Style Sheets","Creative Style Sheets","Colorful Style Sheets"]),
            correctAnswer: "Cascading Style Sheets",
            skillName: "CSS",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "In React, what hook is used to manage state?",
            options: JSON.stringify(["useEffect","useContext","useState","useReducer"]),
            correctAnswer: "useState",
            skillName: "React",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What is the time complexity of binary search?",
            options: JSON.stringify(["O(1)","O(n)","O(n log n)","O(log n)"]),
            correctAnswer: "O(log n)",
            skillName: "Data Structures",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which of these is a NoSQL database?",
            options: JSON.stringify(["PostgreSQL","MySQL","MongoDB","Oracle"]),
            correctAnswer: "MongoDB",
            skillName: "MongoDB",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What does API stand for?",
            options: JSON.stringify(["Application Programming Interface","Advanced Programming Interface","Application Process Integration","Automated Program Interface"]),
            correctAnswer: "Application Programming Interface",
            skillName: "REST APIs",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which language is primarily used for Android app development?",
            options: JSON.stringify(["Swift","Kotlin","Objective-C","Ruby"]),
            correctAnswer: "Kotlin",
            skillName: "Android",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What is a closure in JavaScript?",
            options: JSON.stringify(["A function bundled with its lexical environment","A way to close the browser","A method to end a loop","A variable type"]),
            correctAnswer: "A function bundled with its lexical environment",
            skillName: "JavaScript",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which SQL statement is used to extract data from a database?",
            options: JSON.stringify(["EXTRACT","PULL","SELECT","GET"]),
            correctAnswer: "SELECT",
            skillName: "SQL",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What does AWS stand for?",
            options: JSON.stringify(["Amazon Web Services","Advanced Web Solutions","Automated Web Server","Application Web System"]),
            correctAnswer: "Amazon Web Services",
            skillName: "AWS",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "In Python, how do you create a function?",
            options: JSON.stringify(["function my_func():","def my_func():","create my_func():","fn my_func():"]),
            correctAnswer: "def my_func():",
            skillName: "Python",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which sorting algorithm has the worst-case time complexity of O(n^2)?",
            options: JSON.stringify(["Merge Sort","Heap Sort","Bubble Sort","Radix Sort"]),
            correctAnswer: "Bubble Sort",
            skillName: "Data Structures",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What is the default port for HTTP?",
            options: JSON.stringify(["443","21","8080","80"]),
            correctAnswer: "80",
            skillName: "Networking",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which keyword is used to handle exceptions in Java?",
            options: JSON.stringify(["try-catch","handle-error","if-else","switch"]),
            correctAnswer: "try-catch",
            skillName: "Java",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What is the purpose of a foreign key in SQL?",
            options: JSON.stringify(["To encrypt data","To link two tables together","To generate primary keys","To delete records"]),
            correctAnswer: "To link two tables together",
            skillName: "SQL",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which of the following is NOT a JavaScript framework/library?",
            options: JSON.stringify(["Vue","Angular","Django","React"]),
            correctAnswer: "Django",
            skillName: "JavaScript",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What does MVC stand for?",
            options: JSON.stringify(["Model View Controller","Main Visual Component","Multiple View Configuration","Model Visual Control"]),
            correctAnswer: "Model View Controller",
            skillName: "Architecture",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "In Git, what does `git clone` do?",
            options: JSON.stringify(["Creates a new branch","Copies an existing repository","Deletes a repository","Merges two branches"]),
            correctAnswer: "Copies an existing repository",
            skillName: "Git",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which format is commonly used for data exchange in APIs?",
            options: JSON.stringify(["XML","JSON","CSV","YAML"]),
            correctAnswer: "JSON",
            skillName: "REST APIs",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What is Node.js?",
            options: JSON.stringify(["A frontend framework","A JavaScript runtime","A database","A styling language"]),
            correctAnswer: "A JavaScript runtime",
            skillName: "Node.js",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which of these is a statically typed language?",
            options: JSON.stringify(["Python","JavaScript","Ruby","TypeScript"]),
            correctAnswer: "TypeScript",
            skillName: "TypeScript",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "What does CI/CD stand for?",
            options: JSON.stringify(["Continuous Integration / Continuous Deployment","Code Integration / Code Delivery","Continuous Improvement / Code Deployment","Centralized Integration / Centralized Delivery"]),
            correctAnswer: "Continuous Integration / Continuous Deployment",
            skillName: "DevOps",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "In object-oriented programming, what is inheritance?",
            options: JSON.stringify(["Hiding implementation details","Creating new classes based on existing ones","Bundling data and methods","Multiple functions with the same name"]),
            correctAnswer: "Creating new classes based on existing ones",
            skillName: "Programming Concepts",
            difficulty: 'MEDIUM',
            marks: 1
          },
          {
            questionText: "Which command is used to install packages in Node.js?",
            options: JSON.stringify(["npm install","pip install","gem install","apt-get install"]),
            correctAnswer: "npm install",
            skillName: "Node.js",
            difficulty: 'MEDIUM',
            marks: 1
          }
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
    ];

export const mentorshipPrograms = [
      {
        title: 'Fullstack Web Development Mentorship',
        description: 'I will guide you through building production-ready scalable web applications using React, Node.js, and PostgreSQL. We will meet bi-weekly.',
        maxMentees: 5,
        expertise: ['React', 'Node.js', 'PostgreSQL', 'System Design']
      },
      {
        title: 'Data Science & Machine Learning Mentorship',
        description: 'Learn the ins and outs of deploying ML models in production. We will work on a capstone project together.',
        maxMentees: 3,
        expertise: ['Python', 'Machine Learning', 'Data Science', 'Docker']
      },
      {
        title: 'Open Source Contribution Mentorship',
        description: 'Struggling to make your first OSS contribution? Let me mentor you to get your first PR merged in major repositories.',
        maxMentees: 10,
        expertise: ['Git', 'GitHub', 'Open Source', 'JavaScript']
      }
    ];

export const programsData = [
      {
        title: "Full Stack Development Workshop",
        description: "A hands-on workshop covering the MERN stack with practical projects.",
        type: "WORKSHOP",
        mode: "HYBRID",
        location: "Main Auditorium / Zoom",
        duration: "2 Days",
        capacity: 100,
        certificateAvailable: true,
        status: "PUBLISHED",
        skills: ["React", "Node.js", "Express", "MongoDB"]
      },
      {
        title: "AI-Driven Education & Industry Readiness FDP",
        description: "Faculty Development Program focused on integrating AI into curriculum.",
        type: "FDP",
        mode: "ONLINE",
        location: "Zoom",
        duration: "1 Week",
        capacity: 50,
        certificateAvailable: true,
        status: "PUBLISHED",
        skills: ["Machine Learning", "Python"]
      },
      {
        title: "From Campus to Industry: Building Production-Ready Skills",
        description: "Guest lecture by industry experts on preparing for tech jobs.",
        type: "GUEST_LECTURE",
        mode: "OFFLINE",
        location: "Main Auditorium",
        duration: "2 Hours",
        capacity: 200,
        certificateAvailable: false,
        status: "PUBLISHED",
        skills: []
      },
      {
        title: "Full Stack Industry Training Program",
        description: "Intensive 4-week industrial training with capstone project.",
        type: "INDUSTRIAL_TRAINING",
        mode: "ONLINE",
        location: "Teams",
        duration: "4 Weeks",
        capacity: 30,
        certificateAvailable: true,
        status: "PUBLISHED",
        skills: ["React", "Node.js", "PostgreSQL", "Docker", "AWS"]
      }
    ];

export const demoCerts = [
      {
        title: 'Full Stack Development Workshop Certificate',
        issuer: 'SkillBridge',
        description: 'Completed the intensive Full Stack Development Workshop covering React and Node.js.',
        issueDate: new Date('2026-03-15'),
        sourceType: 'PROGRAM' as const,
        verificationStatus: 'VERIFIED' as const,
        verificationMethod: 'INTERNAL_COMPLETION' as const,
        isPublic: true,
        skillNames: ['react', 'python'],
      },
      {
        title: 'Industrial Training Completion Certificate',
        issuer: 'Google (Demo)',
        description: 'Successfully completed 3-month industrial training in Cloud Computing.',
        issueDate: new Date('2026-06-30'),
        sourceType: 'INTERNSHIP' as const,
        verificationStatus: 'VERIFIED' as const,
        verificationMethod: 'INTERNAL_COMPLETION' as const,
        isPublic: true,
        skillNames: ['aws', 'python'],
      },
      {
        title: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        description: 'Professional certificate covering data analysis with Python and SQL.',
        issueDate: new Date('2026-08-10'),
        credentialId: 'GOOGLE-DA-12345',
        credentialUrl: 'https://coursera.org/verify/GOOGLE-DA-12345',
        sourceType: 'EXTERNAL' as const,
        verificationStatus: 'PENDING' as const,
        verificationMethod: 'SELF_REPORTED' as const,
        isPublic: false,
        skillNames: ['sql', 'python'],
      },
      {
        title: 'AWS Cloud Practitioner',
        issuer: 'Amazon Web Services',
        description: 'AWS Certified Cloud Practitioner certification.',
        issueDate: new Date('2026-07-01'),
        credentialId: 'AWS-CLF-2026',
        sourceType: 'EXTERNAL' as const,
        verificationStatus: 'SELF_REPORTED' as const,
        verificationMethod: 'SELF_REPORTED' as const,
        isPublic: false,
        skillNames: ['aws'],
      },
    ];

export const careerRolesData = [
    {
      title: 'Frontend Developer',
      category: 'Software Engineering',
      skills: [
        { name: 'JavaScript', category: 'Programming Language', domain: 'Computer Science', req: 4, weight: 2.0 },
        { name: 'React', category: 'Frontend Framework', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'HTML', category: 'Frontend', domain: 'Computer Science', req: 4, weight: 1.0 },
        { name: 'CSS', category: 'Frontend', domain: 'Computer Science', req: 4, weight: 1.0 },
      ]
    },
    {
      title: 'Backend Developer',
      category: 'Software Engineering',
      skills: [
        { name: 'Node.js', category: 'Backend Framework', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'Express', category: 'Backend Framework', domain: 'Computer Science', req: 3, weight: 1.0 },
        { name: 'SQL', category: 'Database', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'REST APIs', category: 'Backend', domain: 'Computer Science', req: 4, weight: 1.5 },
      ]
    },
    {
      title: 'Full Stack Developer',
      category: 'Software Engineering',
      skills: [
        { name: 'JavaScript', category: 'Programming Language', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'React', category: 'Frontend Framework', domain: 'Computer Science', req: 3, weight: 1.2 },
        { name: 'Node.js', category: 'Backend Framework', domain: 'Computer Science', req: 3, weight: 1.2 },
        { name: 'SQL', category: 'Database', domain: 'Computer Science', req: 3, weight: 1.0 },
        { name: 'REST APIs', category: 'Backend', domain: 'Computer Science', req: 3, weight: 1.0 },
      ]
    },
    {
      title: 'Data Analyst',
      category: 'Data Science',
      skills: [
        { name: 'SQL', category: 'Database', domain: 'Computer Science', req: 4, weight: 2.0 },
        { name: 'Python', category: 'Programming Language', domain: 'Computer Science', req: 3, weight: 1.5 },
        { name: 'Data Analysis', category: 'Data Science', domain: 'Data Science', req: 4, weight: 2.0 },
      ]
    },
    {
      title: 'Machine Learning Engineer',
      category: 'Data Science',
      skills: [
        { name: 'Python', category: 'Programming Language', domain: 'Computer Science', req: 5, weight: 2.0 },
        { name: 'Machine Learning', category: 'AI', domain: 'Data Science', req: 4, weight: 2.5 },
        { name: 'Data Structures', category: 'Core CS', domain: 'Computer Science', req: 3, weight: 1.0 },
        { name: 'Algorithms', category: 'Core CS', domain: 'Computer Science', req: 3, weight: 1.0 },
      ]
    },
    {
      title: 'DevOps Engineer',
      category: 'Infrastructure',
      skills: [
        { name: 'Docker', category: 'DevOps', domain: 'Computer Science', req: 4, weight: 2.0 },
        { name: 'AWS', category: 'Cloud', domain: 'Computer Science', req: 3, weight: 1.5 },
        { name: 'Git', category: 'Version Control', domain: 'Computer Science', req: 4, weight: 1.0 },
      ]
    },
    {
      title: 'Cloud Engineer',
      category: 'Infrastructure',
      skills: [
        { name: 'AWS', category: 'Cloud', domain: 'Computer Science', req: 4, weight: 2.0 },
        { name: 'Docker', category: 'DevOps', domain: 'Computer Science', req: 3, weight: 1.5 },
      ]
    },
    {
      title: 'Database Developer',
      category: 'Database',
      skills: [
        { name: 'SQL', category: 'Database', domain: 'Computer Science', req: 5, weight: 2.5 },
        { name: 'PostgreSQL', category: 'Database', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'MongoDB', category: 'Database', domain: 'Computer Science', req: 3, weight: 1.0 },
      ]
    },
    {
      title: 'Software Developer',
      category: 'Software Engineering',
      skills: [
        { name: 'Java', category: 'Programming Language', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'C++', category: 'Programming Language', domain: 'Computer Science', req: 3, weight: 1.0 },
        { name: 'Data Structures', category: 'Core CS', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'Algorithms', category: 'Core CS', domain: 'Computer Science', req: 4, weight: 1.5 },
      ]
    },
    {
      title: 'Data Scientist',
      category: 'Data Science',
      skills: [
        { name: 'Python', category: 'Programming Language', domain: 'Computer Science', req: 5, weight: 2.0 },
        { name: 'Machine Learning', category: 'AI', domain: 'Data Science', req: 5, weight: 2.0 },
        { name: 'Data Analysis', category: 'Data Science', domain: 'Data Science', req: 4, weight: 1.5 },
        { name: 'SQL', category: 'Database', domain: 'Computer Science', req: 3, weight: 1.0 },
      ]
    },
    {
      title: 'QA / Test Engineer',
      category: 'Quality Assurance',
      skills: [
        { name: 'Software Testing', category: 'QA', domain: 'Computer Science', req: 4, weight: 2.0 },
        { name: 'Python', category: 'Programming Language', domain: 'Computer Science', req: 3, weight: 1.5 },
        { name: 'Git', category: 'Version Control', domain: 'Computer Science', req: 3, weight: 1.0 },
      ]
    },
    {
      title: 'Cybersecurity Analyst',
      category: 'Security',
      skills: [
        { name: 'Cybersecurity', category: 'Security', domain: 'Computer Science', req: 4, weight: 2.5 },
        { name: 'Networking', category: 'Infrastructure', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'Python', category: 'Programming Language', domain: 'Computer Science', req: 3, weight: 1.0 },
      ]
    },
    {
      title: 'UI/UX Developer',
      category: 'Design',
      skills: [
        { name: 'HTML', category: 'Frontend', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'CSS', category: 'Frontend', domain: 'Computer Science', req: 4, weight: 1.5 },
        { name: 'JavaScript', category: 'Programming Language', domain: 'Computer Science', req: 3, weight: 1.0 },
        { name: 'UI/UX Design', category: 'Design', domain: 'Design', req: 4, weight: 2.0 },
      ]
    }
  ];

