// 활성 프로젝트에 등록된 로컬 HTTP API만 호출합니다.
// JWT 쿠키는 MCP 프로세스 메모리에만 보관하고 결과/로그에 노출하지 않습니다.
export function registerHttpTools({
  server,
  z,
  apiBaseUrl,
  fetchImpl = globalThis.fetch,
}) {
  let jwtCookie = null;

  function localApiBase() {
    if (!apiBaseUrl) {
      throw new Error("활성 프로젝트의 apiBaseUrl이 설정되지 않았습니다. mcp-create.sh로 프로젝트 설정을 갱신하세요.");
    }
    const base = new URL(apiBaseUrl);
    if (
      base.protocol !== "http:"
      || base.hostname !== "127.0.0.1"
      || !base.port
      || base.username
      || base.password
      || base.pathname !== "/"
      || base.search
      || base.hash
    ) {
      throw new Error("apiBaseUrl은 http://127.0.0.1:<port> 형식이어야 합니다.");
    }
    return base;
  }

  function targetUrl(base, requestPath, query) {
    if (
      typeof requestPath !== "string"
      || !requestPath.startsWith("/api/")
      || requestPath.includes("//")
      || /[\\?#]/.test(requestPath)
      || [...requestPath].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
      || requestPath.split("/").some(segment =>
        segment === "." || segment === ".." || /%(?:2e|2f|5c)/i.test(segment))
    ) {
      throw new Error("path는 /api/로 시작하는 정상적인 상대 API 경로여야 합니다.");
    }
    const url = new URL(requestPath, base);
    if (url.origin !== base.origin || !url.pathname.startsWith("/api/")) {
      throw new Error("등록된 프로젝트 API 범위를 벗어나는 요청입니다.");
    }
    for (const [key, value] of Object.entries(query || {})) {
      url.searchParams.set(key, value);
    }
    return url;
  }

  function requestHeaders(extra) {
    const headers = new Headers({ accept: "application/json" });
    const blocked = new Set([
      "host", "cookie", "set-cookie", "content-length", "connection",
      "transfer-encoding", "proxy-authorization", "proxy-connection",
      "forwarded", "x-forwarded-host", "x-forwarded-for", "origin",
    ]);
    for (const [key, value] of Object.entries(extra || {})) {
      if (blocked.has(key.toLowerCase())) {
        throw new Error(`직접 설정할 수 없는 요청 헤더입니다: ${key}`);
      }
      headers.set(key, value);
    }
    return headers;
  }

  function updateLoginSession(response, method, requestPath) {
    if (method === "POST" && requestPath === "/api/v1/signout" && response.ok) {
      jwtCookie = null;
      return;
    }
    if (method !== "POST" || requestPath !== "/api/v1/signin" || !response.ok) {
      return;
    }
    const setCookie = response.headers.getSetCookie?.() || [response.headers.get("set-cookie")].filter(Boolean);
    for (const cookie of setCookie) {
      const match = /^jwt=([^;]*)/i.exec(cookie.trim());
      if (!match) continue;
      jwtCookie = match[1] || null;
    }
  }

  async function responseBody(response) {
    const limit = 1024 * 1024;
    if (!response.body) return { data: null, truncated: false };
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = "";
    let truncated = false;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const remaining = limit - bytes;
        const part = value.subarray(0, Math.max(0, remaining));
        text += decoder.decode(part, { stream: true });
        bytes += part.length;
        if (part.length < value.length) {
          truncated = true;
          await reader.cancel();
          break;
        }
      }
      text += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    let data = text;
    if (!truncated) {
      try {
        data = JSON.parse(text);
      } catch {
        // JSON이 아닌 응답은 원본 문자열을 유지합니다.
      }
    }
    return { data, truncated };
  }

  server.registerTool("http_request", {
    title: "Request active project's local API",
    description: "현재 선택된 프로젝트의 등록된 127.0.0.1 API에만 HTTP 요청을 보냅니다. 로그인 JWT 쿠키는 메모리에 보관하며 요청/응답에 쿠키 값을 출력하지 않습니다. 리디렉션은 따르지 않습니다.",
    inputSchema: {
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
      path: z.string().min(5).max(2048),
      query: z.record(z.string(), z.string()).optional(),
      headers: z.record(z.string(), z.string()).optional(),
      body: z.unknown().optional(),
      useSession: z.boolean().default(true),
      timeoutMs: z.number().int().min(1000).max(30000).default(10000),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
  }, async ({
    method = "GET", path, query, headers, body,
    useSession = true, timeoutMs = 10000,
  }) => {
    const base = localApiBase();
    const url = targetUrl(base, path, query);
    const request = requestHeaders(headers);
    if (useSession && jwtCookie) request.set("cookie", `jwt=${jwtCookie}`);

    let payload;
    if (body !== undefined) {
      if (method === "GET") {
        throw new Error("GET 요청에는 body를 사용할 수 없습니다.");
      }
      payload = JSON.stringify(body);
      if (Buffer.byteLength(payload, "utf8") > 1024 * 1024) {
        throw new Error("요청 body는 1 MiB를 초과할 수 없습니다.");
      }
      request.set("content-type", "application/json");
    }

    const response = await fetchImpl(url, {
      method,
      headers: request,
      body: payload,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    updateLoginSession(response, method, path);
    const { data, truncated } = await responseBody(response);
    const result = {
      status: response.status,
      ok: response.ok,
      data,
      truncated,
    };
    return {
      structuredContent: result,
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  });
}
