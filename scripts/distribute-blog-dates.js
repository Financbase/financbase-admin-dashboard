/**
 * Script to distribute blog post dates throughout 2025
 * Creates 1-3 posts per week for 45 weeks (Jan 1 - Nov 7, 2025)
 */

// Generate dates for 45 weeks starting Jan 1, 2025
const startDate = new Date('2025-01-01');
const weeks = 45;
const postsPerWeek = [1, 2, 3]; // Randomly choose 1-3 posts per week

let allDates = [];
let currentDate = new Date(startDate);

// Generate dates for each week
for (let week = 0; week < weeks; week++) {
  const postsThisWeek = postsPerWeek[Math.floor(Math.random() * postsPerWeek.length)];
  
  // Distribute posts throughout the week (Monday, Wednesday, Friday typically)
  const daysOfWeek = [0, 2, 4]; // Sunday=0, Monday=1, Wednesday=3, Friday=5
  
  for (let i = 0; i < postsThisWeek; i++) {
    const dayOffset = daysOfWeek[i % daysOfWeek.length];
    const postDate = new Date(currentDate);
    postDate.setDate(postDate.getDate() + dayOffset);
    
    // Add random time during business hours (9 AM - 5 PM)
    const hour = 9 + Math.floor(Math.random() * 8);
    const minute = Math.floor(Math.random() * 60);
    postDate.setHours(hour, minute, 0, 0);
    
    allDates.push(new Date(postDate));
  }
  
  // Move to next week
  currentDate.setDate(currentDate.getDate() + 7);
}

// Sort dates chronologically
allDates.sort((a, b) => a - b);

// Format for SQL
const sqlDates = allDates.map(date => {
  return date.toISOString().replace('T', ' ').substring(0, 19);
});

console.log(`Generated ${sqlDates.length} dates`);
console.log('First 10 dates:', sqlDates.slice(0, 10));
console.log('Last 10 dates:', sqlDates.slice(-10));

// Export for use in SQL
module.exports = { sqlDates, allDates };

