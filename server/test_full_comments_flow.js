import app from './index.js';
import db from './db.js';
import http from 'http';

async function testFullFlow() {
  console.log('Testing full API routes for Anime creation and Comments...');

  // Start test server on random port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running on ${baseUrl}`);

  // 1. Check user login session for admin
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: 'admin@aniflux.io', password: 'admin123' })
  });
  const loginJson = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Login Result:', loginJson.user?.username, 'Cookie:', Boolean(cookies));

  // 2. Add a new anime
  const addAnimeRes = await fetch(`${baseUrl}/api/admin/anime`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookies ? { Cookie: cookies } : {})
    },
    body: JSON.stringify({
      title: 'Tokyo Ghoul Test ' + Date.now(),
      japaneseTitle: '東京喰種',
      description: 'Ghouls live among us.',
      type: 'TV',
      status: 'airing',
      episodeCount: 12,
      gumletUrl: 'https://gumlet.tv/watch/6a870965ba1e4a1341b3642f/'
    })
  });
  const addAnimeJson = await addAnimeRes.json();
  console.log('Created Anime:', addAnimeJson.anime?.id, addAnimeJson.anime?.title);
  const createdAnimeId = addAnimeJson.anime.id;

  // 3. Post a comment on Episode 1 as logged-in admin
  const postCommentRes = await fetch(`${baseUrl}/api/anime/${createdAnimeId}/episodes/1/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookies ? { Cookie: cookies } : {})
    },
    body: JSON.stringify({
      commentText: 'Awesome Episode 1! The Gumlet 1080p player works seamlessly.',
      isSpoiler: false
    })
  });
  console.log('Post comment HTTP status:', postCommentRes.status);
  const postCommentJson = await postCommentRes.json();
  console.log('Post Comment Response:', postCommentJson);

  // 4. Fetch comments for this newly created anime
  const getCommentsRes = await fetch(`${baseUrl}/api/anime/${createdAnimeId}/episodes/1/comments`, {
    headers: {
      ...(cookies ? { Cookie: cookies } : {})
    }
  });
  const getCommentsJson = await getCommentsRes.json();
  console.log('Get Comments Response:', getCommentsJson);

  server.close();
  process.exit(0);
}

testFullFlow().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
