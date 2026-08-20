import { validateGumletUrl, formatGumletEmbedUrl, extractGumletAssetId } from './services/gumletService.js';
import streamSupervisor from './services/supervisor.js';
import db from './db.js';

async function runGumletTests() {
  console.log('🧪 Starting Gumlet Video Integration & Self-Supervision Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Test Asset ID Extraction
  const id1 = extractGumletAssetId('https://play.gumlet.io/embed/65719bc42b91866ef114bca8');
  assert(id1 === '65719bc42b91866ef114bca8', 'Extract Asset ID from play.gumlet.io embed URL');

  const id2 = extractGumletAssetId('65719bc42b91866ef114bca8');
  assert(id2 === '65719bc42b91866ef114bca8', 'Extract Asset ID from raw hex ID');

  const id3 = extractGumletAssetId('https://video.gumlet.io/6389f/65719bc42b91866ef114bca8/main.m3u8');
  assert(id3 === '65719bc42b91866ef114bca8', 'Extract Asset ID from video.gumlet.io HLS stream URL');

  const id4 = extractGumletAssetId('https://gumlet.tv/watch/6a870965ba1e4a1341b3642f/');
  assert(id4 === '6a870965ba1e4a1341b3642f', 'Extract Asset ID from gumlet.tv/watch/ URL with trailing slash');

  // 2. Test Live Reachability of Live Gumlet Video Stream (Tokyo Ghoul)
  const tokyoGhoulRes = await validateGumletUrl('https://gumlet.tv/watch/6a870965ba1e4a1341b3642f/', true);
  assert(
    tokyoGhoulRes.valid === true && tokyoGhoulRes.status === 'healthy' && tokyoGhoulRes.assetId === '6a870965ba1e4a1341b3642f',
    'Live Reachability Verification of Real Gumlet Video Stream (HTTP 200)'
  );

  // 3. Test Embed URL Formatting with options
  const embedUrl = formatGumletEmbedUrl('6a870965ba1e4a1341b3642f', {
    autoplay: true,
    subtitles: true,
    color: '6d3bff'
  });
  assert(
    embedUrl.includes('https://play.gumlet.io/embed/6a870965ba1e4a1341b3642f') &&
    embedUrl.includes('autoplay=true') &&
    embedUrl.includes('subtitles=true'),
    'Format Gumlet Embed URL with playback parameters'
  );

  // 3. Test URL Validation & 404 Error Detection
  const validSyntaxRes = await validateGumletUrl('https://play.gumlet.io/embed/65719bc42b91866ef114bca8', false);
  assert(validSyntaxRes.valid === true && validSyntaxRes.assetId === '65719bc42b91866ef114bca8', 'Gumlet URL Format & Asset ID Validation');

  const liveRes = await validateGumletUrl('https://play.gumlet.io/embed/65719bc42b91866ef114bca8', true);
  assert(
    liveRes.valid === false && liveRes.httpStatus === 404 && liveRes.status === 'broken',
    'Live Reachability accurately catches non-existent assets (HTTP 404)'
  );

  const invalidRes = await validateGumletUrl('invalid-broken-random-link', false);
  assert(invalidRes.valid === false && invalidRes.status === 'broken', 'Detect invalid non-Gumlet stream string');

  // 4. Test Stream Supervisor Audit Run
  console.log('\n🔍 Running Stream Health Supervisor catalog audit...');
  const audit = await streamSupervisor.runAudit('test_suite');
  assert(audit.totalChecked > 0, `Supervisor audited ${audit.totalChecked} catalog stream links`);
  assert(audit.healthyCount >= 0, `Supervisor identified ${audit.healthyCount} healthy streams`);

  // 5. Test Error Reports Query
  const brokenReports = await db.getBrokenStreamReports();
  assert(Array.isArray(brokenReports), `Retrieved ${brokenReports.length} timestamped error logs from DB`);

  console.log(`\n========================================`);
  console.log(`🎯 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runGumletTests().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
