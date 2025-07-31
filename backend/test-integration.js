/**
 * Test script to verify 1inch server integration
 * Run this to test if the backend can successfully communicate with the 1inch server
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';
const ONEINCH_SERVER_URL = 'http://localhost:3001';

async function testIntegration() {
  console.log('🧪 Testing 1inch Server Integration\n');

  // Test 1: Check if both servers are running
  console.log('1. Checking server availability...');
  
  try {
    // Test 1inch server health
    const oneInchHealth = await axios.get(`${ONEINCH_SERVER_URL}/health`);
    console.log('✅ 1inch server is running:', oneInchHealth.data.service);
  } catch (error) {
    console.log('❌ 1inch server is not running. Please start it first:');
    console.log('   cd 1inch && npm start');
    return;
  }

  try {
    // Test backend server health
    const backendHealth = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend server is running');
  } catch (error) {
    console.log('❌ Backend server is not running. Please start it first:');
    console.log('   cd backend && npm run dev');
    return;
  }

  // Test 2: Test 1inch server directly
  console.log('\n2. Testing 1inch server directly...');
  
  try {
    const networks = await axios.get(`${ONEINCH_SERVER_URL}/api/networks`);
    console.log('✅ 1inch server networks:', networks.data.networks?.length, 'networks available');
  } catch (error) {
    console.log('❌ Failed to get networks from 1inch server:', error.message);
  }

  try {
    const tokens = await axios.get(`${ONEINCH_SERVER_URL}/api/tokens/1`);
    console.log('✅ 1inch server tokens:', tokens.data.tokens?.total, 'tokens available for Ethereum');
  } catch (error) {
    console.log('❌ Failed to get tokens from 1inch server:', error.message);
  }

  // Test 3: Test backend calling 1inch server (via backend routes)
  console.log('\n3. Testing backend integration with 1inch server...');

  // You can add tests here once backend routes are updated
  console.log('⏳ Backend route tests will be added after route updates');

  console.log('\n🎉 Integration test completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Ensure both servers are running');
  console.log('   2. Set ONEINCH_SERVER_URL=http://localhost:3001 in backend .env');
  console.log('   3. Test backend routes that use 1inch functionality');
}

// Run the test
testIntegration().catch(console.error);