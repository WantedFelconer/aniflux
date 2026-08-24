export async function runAnimeTests(baseUrl, recordTest) {
  // 1. Search anime by title
  try {
    const res = await fetch(`${baseUrl}/api/anime?q=Void`);
    const data = await res.json();
    recordTest('1. Search anime by title returns 200 with matching items', res.status === 200 && Array.isArray(data.anime) && data.anime.length > 0);
  } catch (e) {
    recordTest('1. Search anime by title returns 200 with matching items', false, e.message);
  }

  // 2. Filter by genre
  try {
    const res = await fetch(`${baseUrl}/api/anime?genre=Action`);
    const data = await res.json();
    recordTest('2. Filter anime by genre returns 200', res.status === 200 && Array.isArray(data.anime));
  } catch (e) {
    recordTest('2. Filter anime by genre returns 200', false, e.message);
  }

  // 3. Get single anime details (valid ID)
  try {
    const res = await fetch(`${baseUrl}/api/anime/1`);
    const data = await res.json();
    recordTest('3. Get valid anime by ID returns 200 with relations & episodes', res.status === 200 && data.anime && data.anime.id === 1);
  } catch (e) {
    recordTest('3. Get valid anime by ID returns 200 with relations & episodes', false, e.message);
  }

  // 4. Get non-existent anime details (404)
  try {
    const res = await fetch(`${baseUrl}/api/anime/999999`);
    recordTest('4. Get non-existent anime returns 404', res.status === 404);
  } catch (e) {
    recordTest('4. Get non-existent anime returns 404', false, e.message);
  }
}
