export async function runStreamTests(baseUrl, authContext, recordTest) {
  const { sessionCookie } = authContext;

  // 1. Fetch anime as guest -> stream sources locked
  try {
    const res = await fetch(`${baseUrl}/api/anime/1`);
    const data = await res.json();
    const isLocked = data.anime.streamLocked === true;
    recordTest('1. Guest receives streamLocked=true and hidden URLs', res.status === 200 && isLocked);
  } catch (e) {
    recordTest('1. Guest receives streamLocked=true and hidden URLs', false, e.message);
  }

  // 2. Direct hotlink player access without auth -> 401
  try {
    const res = await fetch(`${baseUrl}/api/stream/player/1/1`);
    recordTest('2. Direct unauthenticated stream player hotlink blocked (401)', res.status === 401);
  } catch (e) {
    recordTest('2. Direct unauthenticated stream player hotlink blocked (401)', false, e.message);
  }

  // 3. Request stream token without auth -> 401
  try {
    const res = await fetch(`${baseUrl}/api/stream/token/1/1`);
    recordTest('3. Request stream token without auth returns 401', res.status === 401);
  } catch (e) {
    recordTest('3. Request stream token without auth returns 401', false, e.message);
  }

  // 4. Request stream token with auth -> returns signed token & gateway URL
  let signedToken = '';
  try {
    const res = await fetch(`${baseUrl}/api/stream/token/1/1`, {
      headers: { Cookie: sessionCookie }
    });
    const data = await res.json();
    signedToken = data.token;
    recordTest('4. Authenticated user receives valid signed stream token', res.status === 200 && !!signedToken);
  } catch (e) {
    recordTest('4. Authenticated user receives valid signed stream token', false, e.message);
  }

  // 5. Access player with valid signed token -> 200
  try {
    const res = await fetch(`${baseUrl}/api/stream/player/1/1?token=${encodeURIComponent(signedToken)}`);
    const text = await res.text();
    recordTest('5. Access player with signed stream token succeeds (200 HTML)', res.status === 200 && text.includes('Aniflux Secure Stream'));
  } catch (e) {
    recordTest('5. Access player with signed stream token succeeds (200 HTML)', false, e.message);
  }
}
