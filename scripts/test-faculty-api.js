const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/faculty',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Data type:', Array.isArray(json) ? 'Array' : typeof json);
            console.log('Data sample:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Raw data:', data);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
