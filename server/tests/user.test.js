export async function runUserTests(baseUrl, authContext, recordTest) {
  const { sessionCookie } = authContext;

  // 1. Add favorite without auth -> 401
  try {
    const res = await fetch(`${baseUrl}/api/me/favorites/1`, { method: 'POST' });
    recordTest('1. Add favorite without auth returns 401', res.status === 401);
  } catch (e) {
    recordTest('1. Add favorite without auth returns 401', false, e.message);
  }

  // 2. Add favorite with auth -> 200
  try {
    const res = await fetch(`${baseUrl}/api/me/favorites/1`, {
      method: 'POST',
      headers: { Cookie: sessionCookie }
    });
    recordTest('2. Add favorite with auth returns 200', res.status === 200);
  } catch (e) {
    recordTest('2. Add favorite with auth returns 200', false, e.message);
  }

  // 3. Get favorites list -> 200
  try {
    const res = await fetch(`${baseUrl}/api/me/favorites`, {
      headers: { Cookie: sessionCookie }
    });
    const data = await res.json();
    recordTest('3. Get favorites list returns 200 with items', res.status === 200 && Array.isArray(data.favorites));
  } catch (e) {
    recordTest('3. Get favorites list returns 200 with items', false, e.message);
  }

  // 4. Add bookmark with auth -> 200
  try {
    const res = await fetch(`${baseUrl}/api/me/bookmarks/1`, {
      method: 'POST',
      headers: { Cookie: sessionCookie }
    });
    recordTest('4. Add bookmark with auth returns 200', res.status === 200);
  } catch (e) {
    recordTest('4. Add bookmark with auth returns 200', false, e.message);
  }

  // 5. Remove favorite -> 200
  try {
    const res = await fetch(`${baseUrl}/api/me/favorites/1`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie }
    });
    recordTest('5. Remove favorite returns 200', res.status === 200);
  } catch (e) {
    recordTest('5. Remove favorite returns 200', false, e.message);
  }
}
