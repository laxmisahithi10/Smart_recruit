#!/usr/bin/env node

import { testGeminiConnection, testGeminiEvaluation } from './test-gemini.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log('🧪 SmartRecruitAI - Gemini API Integration Test');
  console.log('=' .repeat(50));
  
  // Environment Check
  console.log('\n📋 Environment Check:');
  console.log(`✓ Gemini API Key Present: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`✓ Gemini API Key Valid: ${process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here'}`);
  console.log(`✓ OpenAI API Key Present: ${!!process.env.OPENAI_API_KEY}`);
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('\n❌ CRITICAL: Gemini API key is not configured!');
    console.log('Please set GEMINI_API_KEY in your .env file with a valid API key from:');
    console.log('https://makersuite.google.com/app/apikey');
    return;
  }
  
  // Test 1: Basic Connection
  console.log('\n🔌 Test 1: Basic Gemini API Connection');
  console.log('-'.repeat(40));
  
  const connectionTest = await testGeminiConnection();
  if (connectionTest.success) {
    console.log('✅ Connection test PASSED');
    console.log(`   Response: ${connectionTest.data?.response}`);
  } else {
    console.log('❌ Connection test FAILED');
    console.log(`   Error: ${connectionTest.message}`);
    return;
  }
  
  // Test 2: Evaluation Function
  console.log('\n🎯 Test 2: Candidate Evaluation');
  console.log('-'.repeat(40));
  
  const evaluationTest = await testGeminiEvaluation();
  if (evaluationTest.success) {
    console.log('✅ Evaluation test PASSED');
    console.log(`   Overall Score: ${evaluationTest.data?.evaluation?.overallScore}`);
    console.log(`   Recommendation: ${evaluationTest.data?.evaluation?.recommendation}`);
    console.log(`   Strengths: ${evaluationTest.data?.evaluation?.strengths?.join(', ')}`);
  } else {
    console.log('❌ Evaluation test FAILED');
    console.log(`   Error: ${evaluationTest.message}`);
    if (evaluationTest.data?.rawResponse) {
      console.log(`   Raw Response: ${evaluationTest.data.rawResponse.substring(0, 200)}...`);
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('=' .repeat(50));
  
  if (connectionTest.success && evaluationTest.success) {
    console.log('🎉 ALL TESTS PASSED! Your Gemini API integration is working correctly.');
    console.log('\n✅ What\'s working:');
    console.log('   • Gemini API connection established');
    console.log('   • Candidate evaluation function working');
    console.log('   • JSON response parsing successful');
    console.log('\n🚀 You can proceed with your next task!');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    console.log('\n🔧 Next steps:');
    if (!connectionTest.success) {
      console.log('   • Fix Gemini API connection issues');
    }
    if (!evaluationTest.success) {
      console.log('   • Check evaluation function implementation');
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };