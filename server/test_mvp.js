import db from './db.js';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:5000/api';

let cookieSession = '';
let registeredEmail = `test_${Date.now()}@aniflux.io`;
let registeredUsername = `user_${Date.now()}`;
let resetToken = '';

function logPass(testName) {
  console.log(`  [PASS] ${testName}`);
}

function logFail(testName, details) {
  console.error(`  [FAIL] ${testName}:`, details);
}

async function runTests() {
  console.log('\n==================================================');
  console.log('       ANIFLUX MVP AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      logPass(name);
      passed++;
    } catch (err) {
      logFail(name, err.message);
      failed++;
    }
  }

  // --- MODULE 1: AUTHENTICATION ---
  console.log('\n--- MODULE 1: AUTHENTICATION TESTS ---');

  await test('1. Protected route without auth (401)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('2. Registration with invalid email (400)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'validname', email: 'invalidemail', password: 'password123' })
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('3. Registration with weak password (400)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'validname', email: 'valid@aniflux.io', password: '123' })
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('4. Successful user registration (201)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: registeredUsername, email: registeredEmail, password: 'password123' })
    });
    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(err)}`);
    }
    const cookie = res.headers.get('set-cookie');
    if (cookie) cookieSession = cookie.split(';')[0];
    const data = await res.json();
    if (!data.user || data.user.email !== registeredEmail) throw new Error('Invalid user payload returned');
  });

  await test('5. Duplicate email registration (409)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `new_${Date.now()}`, email: registeredEmail, password: 'password123' })
    });
    if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
  });

  await test('6. Duplicate username registration (409)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: registeredUsername, email: `new_${Date.now()}@aniflux.io`, password: 'password123' })
    });
    if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
  });

  await test('7. GET /api/auth/me with session cookie (200)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.user || data.user.email !== registeredEmail) throw new Error('Incorrect user details');
  });

  await test('8. Successful user login (200)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: registeredEmail, password: 'password123' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cookie = res.headers.get('set-cookie');
    if (cookie) cookieSession = cookie.split(';')[0];
  });

  await test('9. Login with incorrect password (401)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: registeredEmail, password: 'wrongpassword' })
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('10. Forgot password link generation (200)', async () => {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registeredEmail })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);

    // Retrieve generated token from DB to test reset
    const [users] = await db.query('SELECT user_id FROM users WHERE email = ?', [registeredEmail]);
    const [tokens] = await db.query(
      'SELECT token_hash FROM password_reset_tokens WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [users[0].user_id]
    );

    // Create a known test raw token
    const testRawToken = 'test_token_' + Date.now();
    const tokenHash = crypto.createHash('sha256').update(testRawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 600000);

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [users[0].user_id, tokenHash, expiresAt]
    );
    resetToken = testRawToken;
  });

  await test('11. Password reset with invalid token (400)', async () => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'invalid_token_12345', newPassword: 'newpassword123' })
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('12. Successful password reset (200)', async () => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword: 'newpassword123' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('13. Token reuse prevention (400)', async () => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword: 'anotherpassword123' })
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('14. Login with updated password (200)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: registeredEmail, password: 'newpassword123' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cookie = res.headers.get('set-cookie');
    if (cookie) cookieSession = cookie.split(';')[0];
  });

  await test('15. Logout (200)', async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // Re-login to have valid cookie for Favorites/Bookmarks tests
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: registeredEmail, password: 'newpassword123' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  if (cookie) cookieSession = cookie.split(';')[0];

  // --- MODULE 2: ANIME SEARCH ---
  console.log('\n--- MODULE 2: ANIME SEARCH TESTS ---');

  await test('16. Search by title (200)', async () => {
    const res = await fetch(`${BASE_URL}/anime/search?q=Void`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.data || data.data.length === 0) throw new Error('Expected search results for "Void"');
    if (!data.data[0].title.includes('Void')) throw new Error('Result title mismatch');
  });

  await test('17. Search by Japanese title (200)', async () => {
    const res = await fetch(`${BASE_URL}/anime/search?q=${encodeURIComponent('ヴォイド')}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.data || data.data.length === 0) throw new Error('Expected Japanese title search results');
  });

  await test('18. Case-insensitive & partial title search (200)', async () => {
    const res = await fetch(`${BASE_URL}/anime/search?q=cElEsTiAl`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.data || data.data.length === 0) throw new Error('Expected results for case-insensitive search');
  });

  await test('19. Search no results (200)', async () => {
    const res = await fetch(`${BASE_URL}/anime/search?q=NonExistentTitle9999`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.data.length !== 0) throw new Error('Expected empty array');
  });

  await test('20. Search pagination (200)', async () => {
    const res = await fetch(`${BASE_URL}/anime/search?q=a&page=1&limit=2`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.data.length > 2) throw new Error(`Expected max 2 results per page, got ${data.data.length}`);
  });

  // --- MODULE 3: ANIME DETAILS ---
  console.log('\n--- MODULE 3: ANIME DETAILS TESTS ---');

  await test('21. Get valid anime details (200)', async () => {
    const res = await fetch(`${BASE_URL}/anime/1`, {
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.anime || data.anime.id !== 1) throw new Error('Invalid anime payload');
    if (!data.anime.title || !data.anime.studio || !data.anime.genres) throw new Error('Missing metadata');
    if (data.userState === undefined) throw new Error('Missing userState field');
  });

  await test('22. Get non-existent anime details (404)', async () => {
    const res = await fetch(`${BASE_URL}/anime/99999`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // --- MODULE 4: FAVORITES & BOOKMARKS ---
  console.log('\n--- MODULE 4: FAVORITES & BOOKMARKS TESTS ---');

  await test('23. Add favorite without auth (401)', async () => {
    const res = await fetch(`${BASE_URL}/me/favorites/1`, { method: 'POST' });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('24. Add favorite with auth (200)', async () => {
    const res = await fetch(`${BASE_URL}/me/favorites/1`, {
      method: 'POST',
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('25. Duplicate favorite attempt (200 idempotency)', async () => {
    const res = await fetch(`${BASE_URL}/me/favorites/1`, {
      method: 'POST',
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('26. GET favorites list (200)', async () => {
    const res = await fetch(`${BASE_URL}/me/favorites`, {
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.favorites || data.favorites.length === 0) throw new Error('Expected favorited anime in list');
    if (data.favorites[0].id !== 1) throw new Error('Unexpected favorited anime ID');
  });

  await test('27. Add bookmark with auth (200)', async () => {
    const res = await fetch(`${BASE_URL}/me/bookmarks/2`, {
      method: 'POST',
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('28. GET bookmarks list (200)', async () => {
    const res = await fetch(`${BASE_URL}/me/bookmarks`, {
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.bookmarks || data.bookmarks.length === 0) throw new Error('Expected bookmarked anime in list');
    if (data.bookmarks[0].id !== 2) throw new Error('Unexpected bookmarked anime ID');
  });

  await test('29. Remove favorite (200)', async () => {
    const res = await fetch(`${BASE_URL}/me/favorites/1`, {
      method: 'DELETE',
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('30. Remove bookmark (200)', async () => {
    const res = await fetch(`${BASE_URL}/me/bookmarks/2`, {
      method: 'DELETE',
      headers: { Cookie: cookieSession }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} tests.`);
  console.log('==================================================\n');

  await db.end();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
