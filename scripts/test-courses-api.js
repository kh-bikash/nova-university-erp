const http = require('http');
const { SignJWT } = require('jose');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

async function generateToken() {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const token = await new SignJWT({ id: 'test-user', role: 'student' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(secret);
    return token;
}

async function testCoursesApi() {
    const token = await generateToken();

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/courses',
        method: 'GET',
        headers: {
            'Cookie': `auth-token=${token}`
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('BODY:', data);
            try {
                const json = JSON.parse(data);
                console.log('Parsed Data Length:', json.data ? json.data.length : 'No data field');
            } catch (e) {
                console.error('Failed to parse JSON');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();
}

testCoursesApi();
