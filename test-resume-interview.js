const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Comprehensive test for resume-based interview endpoint
async function testResumeBasedInterview() {
  try {
    // Create a comprehensive test resume file
    const testResumeContent = `
John Doe
Full Stack Web Developer & Data Science Enthusiast

CONTACT:
Email: john.doe@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

PROFESSIONAL EXPERIENCE:

Senior Frontend Developer - TechCorp Inc. (2022-2024)
• Led development of React.js applications serving 100K+ daily users
• Implemented Redux state management for complex data flows
• Built responsive UI components using Material-UI and Tailwind CSS
• Collaborated with backend teams to integrate GraphQL APIs
• Mentored 3 junior developers on modern JavaScript practices

Full Stack Developer - StartupXYZ (2020-2022)
• Developed web applications using React.js, Node.js, and Express.js
• Designed and implemented RESTful APIs with MongoDB integration
• Built real-time features using Socket.io for live chat functionality
• Implemented JWT authentication and authorization systems
• Deployed applications using Docker and AWS services

Data Analyst Intern - DataSolutions LLC (2019-2020)
• Analyzed large datasets using Python (Pandas, NumPy, Matplotlib)
• Created data visualizations and dashboards using Tableau
• Performed statistical analysis and predictive modeling
• Built automated data pipelines using Apache Airflow
• Presented insights to stakeholders through comprehensive reports

TECHNICAL SKILLS:

Frontend Development:
• Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3
• Frameworks/Libraries: React.js, Vue.js, Angular, Redux, MobX
• UI Libraries: Material-UI, Ant Design, Bootstrap, Tailwind CSS
• Build Tools: Webpack, Vite, Parcel

Backend Development:
• Languages: Node.js, Python, Java
• Frameworks: Express.js, FastAPI, Spring Boot
• Databases: MongoDB, PostgreSQL, MySQL, Redis
• APIs: REST, GraphQL, WebSocket

Data Science & Analytics:
• Languages: Python, R, SQL
• Libraries: Pandas, NumPy, Scikit-learn, TensorFlow, Keras
• Visualization: Matplotlib, Seaborn, Plotly, D3.js
• Tools: Jupyter Notebooks, Apache Spark, Tableau

DevOps & Cloud:
• Cloud Platforms: AWS (EC2, S3, Lambda), Google Cloud Platform
• Containerization: Docker, Kubernetes
• CI/CD: GitHub Actions, Jenkins
• Version Control: Git, GitHub, GitLab

PROJECTS:

E-commerce Platform (2023)
• Built full-stack e-commerce application using React.js and Node.js
• Implemented payment integration with Stripe API
• Used MongoDB for product catalog and user management
• Deployed on AWS with auto-scaling capabilities
• Technologies: React.js, Node.js, Express.js, MongoDB, Stripe, AWS

Data Analytics Dashboard (2022)
• Created interactive dashboard for business intelligence
• Processed and analyzed 1M+ records using Python and Pandas
• Built real-time data visualization using D3.js and WebSocket
• Implemented machine learning models for predictive analytics
• Technologies: Python, FastAPI, D3.js, PostgreSQL, Docker

Social Media App (2021)
• Developed real-time social media platform with 5K+ users
• Implemented features: posts, comments, likes, real-time messaging
• Used Redis for session management and caching
• Built notification system using WebSocket
• Technologies: React.js, Node.js, Socket.io, MongoDB, Redis

EDUCATION:
Bachelor of Science in Computer Science
University of Technology (2016-2020)
• Relevant Coursework: Data Structures, Algorithms, Database Systems,
  Machine Learning, Software Engineering, Web Development
• GPA: 3.8/4.0
• Senior Project: Built machine learning model for stock price prediction

CERTIFICATIONS:
• AWS Certified Developer - Associate (2023)
• Google Analytics Certified (2022)
• MongoDB Certified Developer (2021)

ACHIEVEMENTS:
• Led team that won 1st place in company hackathon (2023)
• Increased application performance by 40% through optimization
• Published technical article on Medium with 10K+ views
• Open source contributor to popular React.js libraries
`;

    // Write test resume to a temporary file
    fs.writeFileSync('comprehensive-test-resume.txt', testResumeContent);

    // Test different domains and difficulties
    const testCases = [
      { domain: 'webdev', difficulty: 'medium', description: 'Web Development - Medium' },
      { domain: 'dataScience', difficulty: 'hard', description: 'Data Science - Hard' },
      { domain: 'hr', difficulty: 'easy', description: 'HR Interview - Easy' },
      { domain: 'fullTechnical', difficulty: 'hard', description: 'Full Technical - Hard' }
    ];

    console.log('🚀 Starting Resume-Based Interview Tests');
    console.log('=' .repeat(50));

    for (const testCase of testCases) {
      console.log(`\\n📋 Testing: ${testCase.description}`);
      console.log('-'.repeat(30));

      try {
        // Prepare the request
        const formData = new FormData();
        formData.append('resume', fs.createReadStream('comprehensive-test-resume.txt'));
        formData.append('domain', testCase.domain);
        formData.append('difficulty', testCase.difficulty);        // Test session creation - Note: endpoint is now /sessions instead of /resume-based
        console.log('Creating interview session...');
        const response = await axios.post('http://localhost:5000/api/interview/sessions', formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE' // Replace with actual token
          }
        });

        console.log('✅ Session created successfully!');
        console.log(`Session ID: ${response.data.data.sessionId}`);
        console.log(`Domain: ${response.data.data.domain}`);
        console.log(`Difficulty: ${response.data.data.difficulty}`);
        console.log(`First Question: ${response.data.data.firstQuestion}`);

        // Test conversation continuation
        console.log('\\nTesting conversation continuation...');
        const continueResponse = await axios.patch(
          `http://localhost:5000/api/interview/sessions/${response.data.data.sessionId}`,
          {
            userResponse: "Thank you for the question. I have extensive experience with the technologies mentioned in my resume, particularly React.js and Node.js. I've worked on several large-scale projects and I'm excited to discuss them in detail."
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE' // Replace with actual token
            }
          }
        );

        console.log('✅ Conversation continued successfully!');
        console.log(`Follow-up Question: ${continueResponse.data.data.question}`);

      } catch (error) {
        console.log(`❌ Error for ${testCase.description}:`);
        if (error.response) {
          console.log(`Status: ${error.response.status}`);
          console.log(`Data:`, error.response.data);
        } else {
          console.log(`Error: ${error.message}`);
        }
      }
    }

    // Clean up
    fs.unlinkSync('comprehensive-test-resume.txt');
    console.log('\\n🧹 Cleaned up test files');

  } catch (error) {
    console.log('❌ Test setup error:', error.message);
    
    // Clean up even on error
    try {
      fs.unlinkSync('comprehensive-test-resume.txt');
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

// Test instructions
console.log('Resume-Based Interview Comprehensive Test');
console.log('=======================================');
console.log('');
console.log('Prerequisites:');
console.log('1. Start Python service: npm run python-service (or equivalent)');
console.log('2. Start Node.js server: npm run dev');
console.log('3. Replace YOUR_AUTH_TOKEN_HERE with valid JWT token');
console.log('4. Ensure both services are running on localhost');
console.log('');
console.log('This test will:');
console.log('• Test all 4 domains (hr, dataScience, webdev, fullTechnical)');
console.log('• Test multiple difficulty levels (easy, medium, hard)');
console.log('• Test session creation and continuation');
console.log('• Use a comprehensive resume with diverse experience');
console.log('');

// Uncomment the line below to run the test
// testResumeBasedInterview();

module.exports = { testResumeBasedInterview };
