/**
 * Instagram Graph API 클라이언트 — 캐러셀 게시 전용.
 *
 * 게시 흐름 (3단계):
 *   1. 각 이미지마다 child container 생성 (image_url + IS_CAROUSEL_ITEM)
 *      → POST /{ig-user-id}/media
 *   2. 캐러셀 container 생성 (CAROUSEL + children + caption)
 *      → POST /{ig-user-id}/media
 *   3. 게시 (publish)
 *      → POST /{ig-user-id}/media_publish
 *
 * 제약:
 *   - 캐러셀 이미지 2~10장 (우리는 8장)
 *   - 각 이미지 1080×1080~1350 (4:5 portrait OK)
 *   - 캡션 2200자 (해시태그 30개 포함)
 *   - 하루 게시 한도 25개
 *   - 캐러셀 처리 ~30초 소요 (status_code=FINISHED 폴링 권장)
 *
 * Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

interface IGCredentials {
  accessToken: string;
  userId: string;
}

function credentials(): IGCredentials {
  const accessToken = process.env.IG_ACCESS_TOKEN;
  const userId = process.env.IG_USER_ID;
  if (!accessToken || !userId) {
    throw new Error(
      "IG_ACCESS_TOKEN and IG_USER_ID must be set (see .env.example)",
    );
  }
  return { accessToken, userId };
}

interface CreateChildContainerArgs {
  imageUrl: string;
}

async function createChildContainer({
  imageUrl,
}: CreateChildContainerArgs): Promise<string> {
  const { accessToken, userId } = credentials();
  const url = `${GRAPH_BASE}/${userId}/media`;
  const params = new URLSearchParams({
    image_url: imageUrl,
    is_carousel_item: "true",
    access_token: accessToken,
  });
  const res = await fetch(url, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(
      `IG child container failed: ${res.status} ${JSON.stringify(data)}`,
    );
  }
  return data.id as string;
}

interface CreateCarouselContainerArgs {
  childIds: string[];
  caption: string;
}

async function createCarouselContainer({
  childIds,
  caption,
}: CreateCarouselContainerArgs): Promise<string> {
  const { accessToken, userId } = credentials();
  const url = `${GRAPH_BASE}/${userId}/media`;
  const params = new URLSearchParams({
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption,
    access_token: accessToken,
  });
  const res = await fetch(url, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(
      `IG carousel container failed: ${res.status} ${JSON.stringify(data)}`,
    );
  }
  return data.id as string;
}

/** 컨테이너가 PUBLISHED 가능한 FINISHED 상태가 될 때까지 폴링. */
async function waitContainerReady(containerId: string, timeoutMs = 90_000) {
  const { accessToken } = credentials();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const url = `${GRAPH_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new Error(`Container failed: ${JSON.stringify(data)}`);
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }
  throw new Error(`Container not ready after ${timeoutMs}ms`);
}

async function publishContainer(containerId: string): Promise<string> {
  const { accessToken, userId } = credentials();
  const url = `${GRAPH_BASE}/${userId}/media_publish`;
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  });
  const res = await fetch(url, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(
      `IG publish failed: ${res.status} ${JSON.stringify(data)}`,
    );
  }
  return data.id as string;
}

export interface PublishCarouselArgs {
  /** 캐러셀에 담을 이미지 공개 URL 2~10개 */
  imageUrls: string[];
  /** 캡션 — 본문 + 빈 줄 + 해시태그 */
  caption: string;
}

export interface PublishCarouselResult {
  postId: string;
  containerIds: string[];
}

/**
 * 풀 캐러셀 게시 흐름. 모든 단계 실패 시 throw.
 */
export async function publishCarousel({
  imageUrls,
  caption,
}: PublishCarouselArgs): Promise<PublishCarouselResult> {
  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error(
      `Carousel needs 2-10 images, got ${imageUrls.length}`,
    );
  }

  // 1. 각 이미지 child container 생성 (병렬 OK)
  const childIds = await Promise.all(
    imageUrls.map((url) => createChildContainer({ imageUrl: url })),
  );

  // 2. 캐러셀 container 생성
  const carouselId = await createCarouselContainer({ childIds, caption });

  // 3. FINISHED 대기 (이미지 다운로드·검증 시간 필요)
  await waitContainerReady(carouselId);

  // 4. 게시
  const postId = await publishContainer(carouselId);

  return { postId, containerIds: [...childIds, carouselId] };
}

/**
 * 인스타 비즈니스 계정 정보 확인 — 토큰 유효성 점검용.
 *   GET /me?fields=instagram_business_account
 */
export async function whoAmI(): Promise<{
  username: string;
  id: string;
}> {
  const { accessToken, userId } = credentials();
  const url = `${GRAPH_BASE}/${userId}?fields=username,id&access_token=${accessToken}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`IG whoami failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return { username: data.username, id: data.id };
}
