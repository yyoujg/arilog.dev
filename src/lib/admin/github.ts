import { Octokit } from "@octokit/rest";

import { env } from "@/lib/env";

const BRANCH = "main";

function getOctokit(): Octokit {
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN이 설정되지 않았습니다");
  return new Octokit({ auth: env.GITHUB_TOKEN });
}

function repoParts(): { owner: string; repo: string } {
  if (!env.GITHUB_REPO) throw new Error("GITHUB_REPO가 설정되지 않았습니다");
  const [owner, repo] = env.GITHUB_REPO.split("/");
  return { owner, repo };
}

function postPath(slug: string): string {
  return `content/posts/${slug}.mdx`;
}

async function getFileSha(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
): Promise<string | undefined> {
  try {
    const res = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: BRANCH,
    });
    return Array.isArray(res.data) ? undefined : res.data.sha;
  } catch {
    return undefined;
  }
}

export async function commitPost(
  slug: string,
  fileContent: string,
  message: string,
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = repoParts();
  const path = postPath(slug);
  const sha = await getFileSha(octokit, owner, repo, path);

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(fileContent, "utf8").toString("base64"),
    sha,
    branch: BRANCH,
  });
}

export async function deletePostFile(
  slug: string,
  message: string,
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = repoParts();
  const path = postPath(slug);
  const res = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref: BRANCH,
  });
  if (Array.isArray(res.data))
    throw new Error(`경로가 파일이 아닙니다: ${path}`);

  await octokit.rest.repos.deleteFile({
    owner,
    repo,
    path,
    message,
    sha: res.data.sha,
    branch: BRANCH,
  });
}
