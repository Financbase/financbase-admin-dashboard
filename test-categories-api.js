#!/usr/bin/env node

/**
 * Test script to verify the categories API endpoint
 * This helps ensure the fix for "categories.map is not a function" works
 */

const fetch = require('node-fetch');

async function testCategoriesAPI() {
  console.log('Testing categories API endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/help/categories');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.log('❌ API returned error status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API response received');
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Data length:', Array.isArray(data) ? data.length : 'N/A');
    
    if (Array.isArray(data)) {
      console.log('✅ Data is properly formatted as an array');
      if (data.length > 0) {
        console.log('Sample category:', data[0]);
      } else {
        console.log('⚠️  Array is empty (this is expected if no categories exist)');
      }
    } else {
      console.log('❌ Data is not an array - this would cause the "categories.map is not a function" error');
      console.log('Actual data:', data);
    }
    
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }
}

// Run the test
testCategoriesAPI();
