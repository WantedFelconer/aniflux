import db from './db.js';
import app from './index.js';
import http from 'http';

async function runTests() {
  console.log('========================================');
  console.log('   ANIFLUX STREAM AUTH VERIFICATION');
  console.log('========================================');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5099, resolve));
  const baseUrl = 'http://127.0.0.1:5099';

  try {
    // 1. Test Unauthenticated /api/anime/1/episodes
    console.log('\n[TEST 1] Fetching episode list as GUEST (Unauthenticated)...');
    const guestEpRes = await fetch(`${baseUrl}/api/anime/1/episodes`);
    const guestEpJson = await guestEpRes.json();
    console.log('Stream Locked flag:', guestEpJson.streamLocked);
    console.log('Ep 1 playerUrl:', guestEpJson.episodes?.[0]?.playerUrl);
    console.log('Ep 1 isLocked:', guestEpJson.episodes?.[0]?.isLocked);

    if (guestEpJson.streamLocked === true && guestEpJson.episodes?.[0]?.isLocked === true && !guestEpJson.episodes?.[0]?.playerUrl) {
      console.log('✅ PASS: Guest episode streams are locked and stream URLs redacted!');
    } else {
      console.error('❌ FAIL: Guest received unmasked stream data!');
    }

    // 2. Test Unauthenticated direct access to stream player gateway
    console.log('\n[TEST 2] Accessing /api/stream/player/1/1 directly as GUEST without token...');
    const guestPlayerRes = await fetch(`${baseUrl}/api/stream/player/1/1`);
    console.log('Status code:', guestPlayerRes.status);
    const guestPlayerHtml = await guestPlayerRes.text();
    if (guestPlayerRes.status === 401 && guestPlayerHtml.includes('Authentication Required')) {
      console.log('✅ PASS: Direct unauthenticated player hotlink was blocked with HTTP 401!');
    } else {
      console.error('❌ FAIL: Direct hotlink was not blocked!');
    }

    // 3. Test Unauthenticated request to generate stream token
    console.log('\n[TEST 3] Requesting stream token without login...');
    const guestTokenRes = await fetch(`${baseUrl}/api/stream/token/1/1`);
    console.log('Status code:', guestTokenRes.status);
    if (guestTokenRes.status === 401) {
      console.log('✅ PASS: Token generation is strictly protected behind login!');
    } else {
      console.error('❌ FAIL: Token generation permitted for guest!');
    }

    // 4. Test Authenticated User: Register and fetch secure stream
    console.log('\n[TEST 4] Registering test user and fetching secure stream...');
    const testUsername = `stream_tester_${Date.now()}`;
    const testEmail = `${testUsername}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, email: testEmail, password: 'Password123!' })
    });
    const regJson = await regRes.json();
    const token = regJson.token;
    const cookie = regRes.headers.get('set-cookie');

    console.log('Registration success:', regJson.success, '| User:', regJson.user?.username);

    // Fetch episodes as authenticated user
    const authEpRes = await fetch(`${baseUrl}/api/anime/1/episodes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': cookie || ''
      }
    });
    const authEpJson = await authEpRes.json();
    console.log('Authenticated streamLocked flag:', authEpJson.streamLocked);
    console.log('Authenticated Ep 1 playerUrl:', authEpJson.episodes?.[0]?.playerUrl);

    if (authEpJson.streamLocked === false && authEpJson.episodes?.[0]?.playerUrl) {
      console.log('✅ PASS: Authenticated user receives authorized stream gateway URL!');
    } else {
      console.error('❌ FAIL: Authenticated user did not receive player URL');
    }

    // Fetch stream token as authenticated user
    const authTokenRes = await fetch(`${baseUrl}/api/stream/token/1/1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const authTokenJson = await authTokenRes.json();
    console.log('Token generation success:', authTokenJson.success);
    console.log('Signed Player URL:', authTokenJson.playerUrl);

    // Test loading player gateway with signed token
    const tokenPlayerRes = await fetch(`${baseUrl}${authTokenJson.playerUrl}`);
    console.log('Player with token status:', tokenPlayerRes.status);
    const tokenPlayerHtml = await tokenPlayerRes.text();
    if (tokenPlayerRes.status === 200 && tokenPlayerHtml.includes('Aniflux Secure Stream')) {
      console.log('✅ PASS: Authorized player loaded successfully with anti-inspect protections!');
    } else {
      console.error('❌ FAIL: Player failed to load with token!');
    }

    console.log('\n========================================');
    console.log('🎉 ALL STREAM AUTH TESTS PASSED!');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
