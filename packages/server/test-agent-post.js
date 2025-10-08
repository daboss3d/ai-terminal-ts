#!/usr/bin/env node

// Test script for the agents POST endpoint
const fetch = require('node-fetch');

async function testPostAgent() {
  console.log('Testing POST /agents endpoint...');
  
  // Test 1: Valid agent
  console.log('\n1. Testing with valid agent data...');
  const validAgent = {
    id: "test-agent-123",
    name: "Test Agent",
    description: "A test agent for validation",
    config: {
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1000
    }
  };
  
  try {
    const response = await fetch('http://localhost:3001/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validAgent)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 2: Invalid agent (missing required fields)
  console.log('\n2. Testing with invalid agent data (missing name)...');
  const invalidAgent = {
    id: "invalid-agent",
    // Missing name field
    description: "An invalid agent without a name"
  };
  
  try {
    const response = await fetch('http://localhost:3001/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidAgent)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 3: Duplicate ID
  console.log('\n3. Testing with duplicate ID...');
  const duplicateAgent = {
    id: "test-agent-123", // Same ID as first test
    name: "Duplicate Agent",
    description: "A duplicate agent"
  };
  
  try {
    const response = await fetch('http://localhost:3001/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicateAgent)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPostAgent();