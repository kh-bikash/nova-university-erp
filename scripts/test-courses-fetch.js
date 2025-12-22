async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/courses');
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testApi();
