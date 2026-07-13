// Runs in CI after `vite build`, writes dist/data/live.json so the deployed
// static site can fetch it at runtime (Milestone 4's `stats` command).
// Tracked repos come from content/projects/*.md's `repo:` frontmatter —
// same "no registry changes" pattern as the rest of the site, so adding a
// project file is enough to also track its live stats.
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const projectsDir = path.join(rootDir, 'content', 'projects');
const outDir = path.join(rootDir, 'dist', 'data');
const outFile = path.join(outDir, 'live.json');

// Unauthenticated public API calls are capped at 60 req/hr *per IP* — easy
// to exhaust from a shared address (confirmed locally on the first call).
// GitHub Actions runners share IP ranges across many concurrent workflows
// worldwide and hit this constantly, so this uses the GITHUB_TOKEN Actions
// auto-injects into every workflow run (5000 req/hr, zero secret to create
// or manage — not a user-provided PAT). Falls back to unauthenticated if
// unset, e.g. for local runs.
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line
      .slice(colonIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key) data[key] = value;
  }
  return data;
}

function getTrackedRepos() {
  return readdirSync(projectsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = readFileSync(path.join(projectsDir, f), 'utf8');
      const fm = parseFrontmatter(raw);
      return fm.repo ? { repo: fm.repo, label: fm.title ?? fm.repo } : null;
    })
    .filter(Boolean);
}

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// GitHub's REST API has no direct "total commits" field. Standard trick:
// request 1 commit per page and read the last page number off the `Link`
// response header — that page number equals the total commit count.
async function fetchCommitCount(repo, branch) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/commits?sha=${branch}&per_page=1`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(`commit count fetch failed for ${repo}: ${res.status} ${res.statusText}`);
  }
  const link = res.headers.get('link');
  if (!link) return 1; // single page of results = exactly 1 commit
  const match = link.match(/[?&]page=(\d+)[^,]*>;\s*rel="last"/);
  return match ? parseInt(match[1], 10) : 1;
}

async function buildProjectEntry({ repo, label }) {
  const repoData = await fetchJson(`https://api.github.com/repos/${repo}`);
  const defaultBranch = repoData.default_branch;
  const [commitData, commitCount] = await Promise.all([
    fetchJson(`https://api.github.com/repos/${repo}/commits/${defaultBranch}`),
    fetchCommitCount(repo, defaultBranch),
  ]);
  return {
    repo,
    label,
    defaultBranch,
    lastCommitDate: commitData.commit.author.date,
    lastCommitMessage: commitData.commit.message.split('\n')[0],
    commitCount,
    openIssueCount: repoData.open_issues_count,
  };
}

async function main() {
  const tracked = getTrackedRepos();
  const projects = await Promise.all(tracked.map(buildProjectEntry));
  const payload = { generatedAt: new Date().toISOString(), projects };
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(payload, null, 2) + '\n');
  console.log(`Wrote ${outFile} with ${projects.length} project(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
