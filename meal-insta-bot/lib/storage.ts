/**
 * Supabase Storage에 PNG 업로드 → public URL 반환.
 * Instagram Graph API는 image_url 파라미터에 공개 URL을 요구해서 호스팅 필수.
 *
 * 사전 셋업:
 *   1. Supabase 프로젝트 생성
 *   2. Storage > Create bucket "card-images" (Public 체크)
 *   3. .env.local에 SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 채우기
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "card-images";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env",
    );
  }
  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

/**
 * PNG 버퍼를 Supabase Storage에 업로드.
 * @param buffer  PNG 바이너리
 * @param key     "2026-05-08/recipe-1/card-00.png" 같은 경로
 * @returns       public URL (CDN 캐시 적용)
 */
export async function uploadCardImage(
  buffer: Buffer,
  key: string,
): Promise<string> {
  const client = getClient();
  const { error } = await client.storage.from(BUCKET).upload(key, buffer, {
    contentType: "image/png",
    upsert: true,
    cacheControl: "31536000", // 1년 캐시 (게시 후 수정 안 함)
  });
  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }
  const {
    data: { publicUrl },
  } = client.storage.from(BUCKET).getPublicUrl(key);
  return publicUrl;
}

/**
 * 데크 전체 업로드. 키 명명 규칙: <date>/<source>/card-<NN>.png
 */
export async function uploadDeck(
  buffers: Buffer[],
  meta: { date: string; source: string },
): Promise<string[]> {
  const sourceSlug = meta.source.replace(/[^a-z0-9-]/gi, "_");
  const urls: string[] = [];
  for (let i = 0; i < buffers.length; i++) {
    const key = `${meta.date}/${sourceSlug}/card-${String(i).padStart(2, "0")}.png`;
    const url = await uploadCardImage(buffers[i], key);
    urls.push(url);
  }
  return urls;
}
