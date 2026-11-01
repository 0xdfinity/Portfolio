import { siteConfig, featuredCopy } from '../config';

export type GithubRepo = {
  name: string; full_name: string; html_url: string; description: string | null;
  language: string | null; pushed_at: string; fork: boolean; topics?: string[];
  archived?: boolean; disabled?: boolean;
};

const api = 'https://api.github.com';
const headers: HeadersInit = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(import.meta.env.GITHUB_TOKEN ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` } : {}),
};

export async function getGithubRepos(): Promise<GithubRepo[]> {
  try {
    const repos: GithubRepo[] = [];
    let url: string | null = `${api}/users/${siteConfig.githubUser}/repos?type=public&sort=pushed&direction=desc&per_page=100`;
    while (url) {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`GitHub repos returned ${response.status}`);
      repos.push(...((await response.json()) as GithubRepo[]));
      url = response.headers.get('Link')?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
    }
    return repos;
  } catch (error) {
    console.warn('GitHub repo fetch unavailable; showing featured case-study copy only.', error);
    return [];
  }
}

export type CommitActivity = { count: number; windowStart: string; windowEnd: string };

// Counts unique commits authored by this GitHub account across its public repositories.
// Any endpoint failure or truncated pagination changes the displayed claim to a lower bound.
export async function getCommitActivity(): Promise<CommitActivity> {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const windowStart = start.toISOString();
  const startDay = windowStart.slice(0, 10);
  const endDay = end.toISOString().slice(0, 10);
  const query = `author:${siteConfig.githubUser} committer-date:${startDay}..${endDay}`;
  const commits = new Set<string>();
  let complete = true;
  let page = 1;
  let reportedTotal: number | null = null;

  try {
    do {
      const url = `${api}/search/commits?q=${encodeURIComponent(query)}&per_page=100&page=${page}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`GitHub commit search returned ${response.status}`);
      const data = await response.json() as {
        total_count: number;
        incomplete_results?: boolean;
        items: Array<{ sha: string; commit: { committer?: { date?: string } } }>;
      };
      reportedTotal = data.total_count;
      if (data.incomplete_results) complete = false;
      for (const commit of data.items) {
        const committedAt = commit.commit.committer?.date;
        if (committedAt && committedAt >= windowStart && committedAt <= end.toISOString()) commits.add(commit.sha);
      }
      if (data.total_count > 1000 || commits.size >= 1000) complete = false;
      page += 1;
      if (page > 10 || (reportedTotal !== null && (page - 1) * 100 >= reportedTotal)) break;
    } while (true);
  } catch (error) {
    console.warn('GitHub commit activity unavailable at build time.', error);
    return { count: 0, windowStart, windowEnd: end.toISOString() };
  }
  return { count: commits.size, complete, windowStart, windowEnd: end.toISOString() };
}

async function readmeDescription(repo: GithubRepo): Promise<string> {
  try {
    const response = await fetch(`${api}/repos/${repo.full_name}/readme`, { headers });
    if (!response.ok) return repo.description || '';
    const data = await response.json() as { content?: string; encoding?: string };
    if (!data.content || data.encoding !== 'base64') return repo.description || '';
    const markdown = atob(data.content.replace(/\s/g, ''));
    const paragraph = markdown
      .replace(/^---\s*[\s\S]*?^---\s*/m, '')
      .split(/\r?\n\s*\r?\n/)
      .map((part) => part.replace(/<!--([\s\S]*?)-->/g, '').trim())
      .find((part) => part && !/^#/.test(part) && !/^!\[/.test(part) && !/^<.*>$/.test(part));
    const clean = (paragraph || '').replace(/[`*_>#\[\]]/g, '').replace(/\((https?:\/\/[^)]+)\)/g, '').replace(/\s+/g, ' ').trim();
    return (clean || repo.description || '').slice(0, 260);
  } catch {
    return repo.description || '';
  }
}

export async function getFeatured(repos: GithubRepo[]) {
  return await Promise.all(siteConfig.featuredRepos.map(async (name) => {
    const copy = featuredCopy[name] ?? { title: name, problem: '', contribution: '', fallback: '', status: 'open source' };
    const repo = repos.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (!repo || name === 'edQorta') {
      return { ...copy, name, repo: null, description: copy.fallback, tags: ['Product', 'In development'] };
    }
    const description = await readmeDescription(repo);
    const tags = [...(repo.topics || []).slice(0, 3), ...(repo.language ? [repo.language] : [])].filter((value, index, arr) => arr.indexOf(value) === index);
    return { ...copy, name, repo, description: description || copy.fallback, tags };
  }));
}

export function getRecentRepos(repos: GithubRepo[]) {
  const featured = new Set(siteConfig.featuredRepos.map((name) => name.toLowerCase()));
  const excluded = /^(0xdfinity|profile|readme|template|hello-world|test|playground|archive)(-|$)/i;
  return repos
    .filter((repo) => !repo.fork && !repo.archived && !repo.disabled && !featured.has(repo.name.toLowerCase()) && !excluded.test(repo.name))
    .slice(0, 6);
}
