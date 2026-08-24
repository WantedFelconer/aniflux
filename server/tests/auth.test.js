export async function runAuthTests(baseUrl, recordTest) {
  const unique = Date.now();
  const testUser = {
    username: `tester_${unique}`,
    email: `tester_${unique}@aniflux.test`,
    password: 'Password123!'
  };

  let sessionCookie = '';
  let authToken = '';

  // 1. Protected route without auth
  try {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    recordTest('1. Protected route without auth returns 401', res.status === 401);
  } catch (e) {
    recordTest('1. Protected route without auth returns 401', false, e.message);
  }

  // 2. Registration with invalid email
  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'validuser', email: 'invalid-email', password: 'Password123!' })
    });
    recordTest('2. Registration with invalid email returns 400', res.status === 400);
  } catch (e) {
    recordTest('2. Registration with invalid email returns 400', false, e.message);
  }

  // 3. Registration with weak password
  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'validuser', email: 'valid@email.com', password: '123' })
    });
    recordTest('3. Registration with weak password returns 400', res.status === 400);
  } catch (e) {
    recordTest('3. Registration with weak password returns 400', false, e.message);
  }

  // 4. Successful user registration
  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) sessionCookie = setCookie.split(';')[0];
    const data = await res.json();
    authToken = data.token;
    recordTest('4. Successful user registration returns 201 with session', res.status === 201 && !!data.user);
  } catch (e) {
    recordTest('4. Successful user registration returns 201 with session', false, e.message);
  }

  // 5. Duplicate registration
  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    recordTest('5. Duplicate email registration returns 409', res.status === 409);
  } catch (e) {
    recordTest('5. Duplicate email registration returns 409', false, e.message);
  }

  // 6. GET /api/auth/me with session
  try {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: sessionCookie }
    });
    const data = await res.json();
    recordTest('6. GET /api/auth/me with session returns 200', res.status === 200 && data.user.username === testUser.username);
  } catch (e) {
    recordTest('6. GET /api/auth/me with session returns 200', false, e.message);
  }

  // 7. Successful user login
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: testUser.email, password: testUser.password })
    });
    const data = await res.json();
    recordTest('7. Successful user login returns 200', res.status === 200 && data.user.email === testUser.email);
  } catch (e) {
    recordTest('7. Successful user login returns 200', false, e.message);
  }

  // 8. Login with wrong password
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: testUser.email, password: 'WrongPassword' })
    });
    recordTest('8. Login with wrong password returns 401', res.status === 401);
  } catch (e) {
    recordTest('8. Login with wrong password returns 401', false, e.message);
  }

  return { testUser, sessionCookie, authToken };
}
