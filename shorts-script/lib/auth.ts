const COOKIE_NAME = "shorts_script_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30일

function getSecret(): string {
  const secret = process.env.TEAM_PASSWORD;
  if (!secret) {
    throw new Error("TEAM_PASSWORD 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(sig);
}

// 길이가 다르면 그 시점에 끝나지만, 같은 길이일 때는 항상 전체를 비교한다 (타이밍 공격 완화).
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = await sign(payload);
  if (!timingSafeEqualStr(sig, expected)) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return true;
}

export function checkTeamPassword(input: string): boolean {
  return timingSafeEqualStr(input, getSecret());
}

export { COOKIE_NAME };
