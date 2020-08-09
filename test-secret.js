//import dotenv from 'dotenv';
dotenv.config();
/*
require('dotenv').config();

console.log('process.env: ' + process.env);
console.log('dotenv: ' + TEST_SECRET);
console.log('github-secrets: ' + ${{secrets.TEST_SECRET}});
*/
console.log('github-secrets: ' + process.env.test_secret);