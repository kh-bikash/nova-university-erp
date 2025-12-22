const { SignJWT } = require('jose');
const http = require('http');
require('dotenv').config();

async function debugFaculty() {
    // 1. Create a valid token for an admin
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
    const token = await new SignJWT({
        id: 'admin-id-placeholder', // We don't strictly need a real ID for the middleware check, just the role
        role: 'admin',
        email: 'admin@example.com'
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(secret);

    console.log('Generated Token for Admin role');

    // 2. Make request to /api/faculty
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/faculty',
        method: 'GET',
        headers: {
            'Cookie': `auth-token=${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('API Status:', res.statusCode);
            console.log('API Headers:', res.headers);
            try {
                const json = JSON.parse(data);
                console.log('API Response Preview:', JSON.stringify(json, null, 2).substring(0, 500));
                if (Array.isArray(json)) {
                    console.log('Success: Received array of length', json.length);
                } else {
                    console.log('Failure: Response is not an array');
                }
            } catch (e) {
                console.log('Raw Body:', data);
            }
        });
    });

    req.on('error', e => console.error('Request Error:', e));
    req.end();
}

debugFaculty();
