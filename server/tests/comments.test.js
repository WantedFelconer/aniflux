export async function runCommentsTests(baseUrl, authContext, recordTest) {
  const { sessionCookie } = authContext;
  let postedCommentId = null;

  // 1. Post comment without auth -> 401
  try {
    const res = await fetch(`${baseUrl}/api/anime/1/episodes/1/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Great episode!' })
    });
    recordTest('1. Post comment without auth returns 401', res.status === 401);
  } catch (e) {
    recordTest('1. Post comment without auth returns 401', false, e.message);
  }

  // 2. Post comment with auth -> 201
  try {
    const res = await fetch(`${baseUrl}/api/anime/1/episodes/1/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie
      },
      body: JSON.stringify({ text: 'Modular monolith comments test comment!', isSpoiler: false })
    });
    const data = await res.json();
    postedCommentId = data.comment?.id;
    recordTest('2. Post comment with auth returns 201', res.status === 201 && !!postedCommentId);
  } catch (e) {
    recordTest('2. Post comment with auth returns 201', false, e.message);
  }

  // 3. Get episode comments
  try {
    const res = await fetch(`${baseUrl}/api/anime/1/episodes/1/comments`, {
      headers: { Cookie: sessionCookie }
    });
    const data = await res.json();
    recordTest('3. Get episode comments returns 200 with list', res.status === 200 && Array.isArray(data.comments));
  } catch (e) {
    recordTest('3. Get episode comments returns 200 with list', false, e.message);
  }

  // 4. Like comment
  if (postedCommentId) {
    try {
      const res = await fetch(`${baseUrl}/api/comments/${postedCommentId}/like`, {
        method: 'POST',
        headers: { Cookie: sessionCookie }
      });
      const data = await res.json();
      recordTest('4. Like comment returns 200 with updated likes count', res.status === 200 && data.hasLiked === true);
    } catch (e) {
      recordTest('4. Like comment returns 200 with updated likes count', false, e.message);
    }
  }
}
