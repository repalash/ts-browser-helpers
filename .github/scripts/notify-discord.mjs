// Discord notice for the publish workflow: the package is built and waits for approval, or the build failed.
// Env: DISCORD_WEBHOOK_URL (repo secret; no notice when unset), PKG (name@version), BUILD_OK, COMMITS (git log --oneline),
// CLAUDE_SESSION (the review session the run started, if any).
const {DISCORD_WEBHOOK_URL: url, PKG, BUILD_OK, COMMITS, CLAUDE_SESSION, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID} = process.env
if (!url) {
    console.log('DISCORD_WEBHOOK_URL is not set; no notice.')
    process.exit(0)
}
const run = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
const ok = BUILD_OK === 'true'
const lines = ok
    ? [`📦 **${PKG}** is built and waits for approval to publish to npm.`, `Approve: ${run}`]
    : [`❌ **${PKG}**: the build or the tests failed; nothing is published.`, `Log: ${run}`]
if (ok && CLAUDE_SESSION) lines.push(`🤖 Claude review: ${CLAUDE_SESSION}`)
const commits = (COMMITS || '').split('\n').filter(Boolean).slice(0, 20)
if (commits.length) lines.push('', ...commits.map(l => `- \`${l.slice(0, l.indexOf(' '))}\` ${l.slice(l.indexOf(' ') + 1)}`))
const res = await fetch(url, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({content: lines.join('\n').slice(0, 1990)}),
})
if (!res.ok) {
    console.error(`Discord webhook: HTTP ${res.status}`)
    process.exit(1)
}
