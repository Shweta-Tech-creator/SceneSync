require('dotenv').config();

console.log('--- Auth Configuration Check ---');

const checkVar = (name) => {
    const value = process.env[name];
    if (value && value.length > 0) {
        if (name.includes('SECRET') || name.includes('KEY')) {
            console.log(`${name}: [PRESENT] (Masked: ${value.substring(0, 4)}...)`);
        } else {
            console.log(`${name}: [PRESENT] ${value}`);
        }
    } else {
        console.log(`${name}: [MISSING or EMPTY]`);
    }
};

checkVar('GOOGLE_CLIENT_ID');
checkVar('GOOGLE_CLIENT_SECRET');
checkVar('GITHUB_CLIENT_ID');
checkVar('GITHUB_CLIENT_SECRET');
checkVar('JWT_SECRET');
checkVar('FRONTEND_URL');
checkVar('PORT');

console.log('\n--- Callback URLs (Expected based on env) ---');
console.log(`Google Callback: /api/auth/google/callback`);
console.log(`GitHub Callback: /api/auth/github/callback`);

console.log('\n--- Done ---');
