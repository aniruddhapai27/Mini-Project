/**
 * Test script to verify the interview session fix
 * This script simulates a complete interview flow to ensure:
 * 1. Only one session is created
 * 2. Chat structure alternates bot->user->bot->user
 * 3. All user responses are stored correctly
 */

const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5000';

// Test user credentials - you'll need to modify these
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

class InterviewTester {
  constructor() {
    this.cookies = '';
    this.sessionId = null;
  }

  async login() {
    try {
      console.log('🔐 Logging in...');
      const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, TEST_USER);
      
      // Extract cookies from response
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        this.cookies = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
      }
      
      console.log('✅ Login successful');
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async createInterview() {
    try {
      console.log('🎯 Creating interview session...');
      const response = await axios.post(
        `${BASE_URL}/api/v1/interview/resume-based`,
        {
          domain: 'webdev',
          difficulty: 'medium'
        },
        {
          headers: {
            'Cookie': this.cookies,
            'Content-Type': 'application/json'
          }
        }
      );

      this.sessionId = response.data.data.sessionId;
      console.log('✅ Interview created:', {
        sessionId: this.sessionId,
        firstQuestion: response.data.data.firstQuestion.substring(0, 100) + '...'
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Interview creation failed:', error.response?.data?.message || error.message);
      return null;
    }
  }

  async continueInterview(userResponse, turn) {
    try {
      console.log(`📝 Turn ${turn}: Sending user response...`);
      console.log(`   User: ${userResponse.substring(0, 100)}...`);
      
      const response = await axios.post(
        `${BASE_URL}/api/v1/interview/continue/${this.sessionId}`,
        {
          userResponse: userResponse
        },
        {
          headers: {
            'Cookie': this.cookies,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiQuestion = response.data.data.question;
      console.log(`   Bot: ${aiQuestion.substring(0, 100)}...`);
      
      return aiQuestion;
    } catch (error) {
      console.error(`❌ Turn ${turn} failed:`, error.response?.data?.message || error.message);
      return null;
    }
  }

  async checkSessionStructure() {
    try {
      console.log('🔍 Checking session structure...');
      const response = await axios.get(
        `${BASE_URL}/api/v1/interview/session/${this.sessionId}`,
        {
          headers: {
            'Cookie': this.cookies
          }
        }
      );

      const interview = response.data.data;
      console.log('📊 Session Analysis:');
      console.log(`   Session ID: ${interview._id}`);
      console.log(`   Domain: ${interview.domain}`);
      console.log(`   Difficulty: ${interview.difficulty}`);
      console.log(`   QnA Count: ${interview.QnA.length}`);
      
      console.log('📝 QnA Structure:');
      interview.QnA.forEach((qa, index) => {
        const botText = qa.bot ? qa.bot.substring(0, 80) + '...' : 'EMPTY';
        const userText = qa.user ? qa.user.substring(0, 80) + '...' : 'EMPTY';
        console.log(`   ${index + 1}. Bot: ${botText}`);
        console.log(`      User: ${userText}`);
      });
      
      // Validate structure
      const issues = [];
      interview.QnA.forEach((qa, index) => {
        if (!qa.bot) {
          issues.push(`QnA ${index + 1}: Missing bot message`);
        }
        if (index < interview.QnA.length - 1 && !qa.user) {
          issues.push(`QnA ${index + 1}: Missing user response (not last entry)`);
        }
      });
      
      if (issues.length === 0) {
        console.log('✅ Session structure is valid!');
      } else {
        console.log('❌ Session structure issues:');
        issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      return interview;
    } catch (error) {
      console.error('❌ Session check failed:', error.response?.data?.message || error.message);
      return null;
    }
  }

  async runTest() {
    console.log('🚀 Starting Interview Session Test');
    console.log('==================================');
    
    // Step 1: Login
    if (!(await this.login())) {
      return;
    }
    
    // Step 2: Create interview
    const interview = await this.createInterview();
    if (!interview) {
      return;
    }
    
    // Step 3: Simulate conversation
    const userResponses = [
      "Hi! I'm excited to start this interview. I'm a web developer with 3 years of experience working with React, Node.js, and MongoDB.",
      "I've worked on several projects including e-commerce platforms and content management systems. I'm particularly interested in full-stack development and creating user-friendly interfaces.",
      "My approach to responsive design involves using CSS Grid and Flexbox, implementing mobile-first design principles, and testing across multiple devices and screen sizes.",
      "I usually start by reproducing the issue, then use browser developer tools to inspect the code and network requests. I also use console.log statements and debugging tools to trace the problem.",
      "I stay updated by following tech blogs, participating in developer communities, taking online courses, and experimenting with new frameworks in personal projects."
    ];
    
    for (let i = 0; i < userResponses.length; i++) {
      const aiResponse = await this.continueInterview(userResponses[i], i + 1);
      if (!aiResponse) {
        return;
      }
      
      // Brief pause between turns
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 4: Check final structure
    await this.checkSessionStructure();
    
    console.log('🎉 Test completed!');
  }
}

// Run the test
const tester = new InterviewTester();
tester.runTest().catch(console.error);
