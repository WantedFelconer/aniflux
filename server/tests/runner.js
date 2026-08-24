import app from '../index.js';
import http from 'http';
import { runAuthTests } from './auth.test.js';
import { runAnimeTests } from './anime.test.js';
import { runStreamTests } from './stream.test.js';
import { runCommentsTests } from './comments.test.js';
import { runUserTests } from './user.test.js';

let passed = 0;
let failed = 0;

export function recordTest(name, isPass, error = null) {
  if (isPass) {
    passed++;
    console.log(`  \x1b[32m[PASS]\x1b[0m ${name}`);
  } else {
    failed++;
    console.error(`  \x1b[31m[FAIL]\x1b[0m ${name}`);
    if (error) console.error(`         └─ Error: ${error}`);
  }
}

async function startTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({ server, baseUrl });
    });
  });
}

async function main() {
  console.log('\n==================================================');
  console.log('       ANIFLUX MODULAR MONOLITH TEST SUITE       ');
  console.log('==================================================\n');

  const { server, baseUrl } = await startTestServer();

  try {
    console.log('--- MODULE 1: AUTHENTICATION & SESSIONS ---');
    const authContext = await runAuthTests(baseUrl, recordTest);

    console.log('\n--- MODULE 2: ANIME CATALOG & SEARCH ---');
    await runAnimeTests(baseUrl, recordTest);

    console.log('\n--- MODULE 3: SECURE STREAMING GATEWAY ---');
    await runStreamTests(baseUrl, authContext, recordTest);

    console.log('\n--- MODULE 4: EPISODE COMMENTS & DISCUSSIONS ---');
    await runCommentsTests(baseUrl, authContext, recordTest);

    console.log('\n--- MODULE 5: USER LIBRARY & FAVORITES ---');
    await runUserTests(baseUrl, authContext, recordTest);

  } catch (err) {
    console.error('\nFatal test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n==================================================');
  const total = passed + failed;
  if (failed === 0) {
    console.log(`\x1b[32mSUCCESS: ALL ${passed}/${total} TESTS PASSED!\x1b[0m`);
  } else {
    console.log(`\x1b[31mFAILURE: ${failed}/${total} TESTS FAILED (${passed} passed).\x1b[0m`);
  }
  console.log('==================================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

main();
