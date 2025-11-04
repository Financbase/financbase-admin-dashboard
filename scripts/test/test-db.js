import { checkDatabaseHealth } from './lib/db/index';

console.log('Testing database connection...');
checkDatabaseHealth().then(result => {
  console.log('Database health check result:', result);
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Database connection error:', err.message);
  process.exit(1);
});
