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

// posts/projects 공용 — content/<kind>/<slug>.mdx 경로를 그대로 받아 upsert한다.
export async function commitContentFile(
  path: string,
  fileContent: string,
  message: string,
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = repoParts();
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

// 생성 시 slug 중복 차단용 — 파일 존재 여부만 필요한 호출부에서 쓴다.
export async function contentFileExists(path: string): Promise<boolean> {
  const octokit = getOctokit();
  const { owner, repo } = repoParts();
  return (await getFileSha(octokit, owner, repo, path)) !== undefined;
}

// 파일명이 콘텐츠 해시라 경로가 곧 내용의 지문이다. 이미 존재하면 업로드된
// 바이트가 이미 동일하다는 뜻이므로 재커밋 없이 그대로 성공 처리한다(멱등).
// 동일 경로에 sha 없이 createOrUpdateFileContents를 호출하면 GitHub가
// 422("sha wasn't supplied")로 거부하기 때문에 사전 조회가 꼭 필요하다.
export async function commitImage(
  path: string,
  base64Content: string,
  message: string,
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = repoParts();

  const sha = await getFileSha(octokit, owner, repo, path);
  if (sha) return;

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: base64Content,
    branch: BRANCH,
    sha, // 이 시점엔 항상 undefined(신규 생성)이지만, 위 조기 반환이 사라지는
    // 리팩터를 대비해 항상 넘겨둔다.
  });
}

export async function deleteContentFile(
  path: string,
  message: string,
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = repoParts();
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
