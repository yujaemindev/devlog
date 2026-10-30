// HTTP 도구는 등록된 로컬 API만 호출하고 로그인 쿠키를 외부로 노출하지 않습니다.
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { registerHttpTools } from "../../../mcp-src/tools/http-tools.mjs";

function setup(fetchImpl, apiBaseUrl = "http://127.0.0.1:3000") {
  const definitions = new Map();
  const server = {
    registerTool(name, options, handler) {
      definitions.set(name, { options, handler });
    },
  };
  registerHttpTools({ server, z, apiBaseUrl, fetchImpl });
  const call = input => definitions.get("http_request").handler(input);
  return { call, definitions };
}

describe("http_request", () => {
  it("로컬 API health 응답과 상태 코드를 반환한다", async () => {
    const fetchImpl = vi.fn(async () => new Response("ok", { status: 200 }));
    const { call } = setup(fetchImpl);
    const result = await call({ method: "GET", path: "/api/health" });

    expect(result.structuredContent).toEqual({
      status: 200, ok: true, data: "ok", truncated: false,
    });
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url.toString()).toBe("http://127.0.0.1:3000/api/health");
    expect(options.redirect).toBe("manual");
    expect(options.method).toBe("GET");
  });

  it("경로와 query를 안전하게 합성한다", async () => {
    const fetchImpl = vi.fn(async () => Response.json([{ id: 1 }]));
    const { call } = setup(fetchImpl);
    const result = await call({
      method: "GET",
      path: "/api/v1/users",
      query: { prefix: "김 토스", page: "1" },
    });
    expect(fetchImpl.mock.calls[0][0].searchParams.get("prefix")).toBe("김 토스");
    expect(result.structuredContent.data).toEqual([{ id: 1 }]);
  });

  it("로그인 쿠키를 후속 요청에만 자동 사용하며 응답에는 표시하지 않는다", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Login successful" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "jwt=secret-token; HttpOnly; Path=/",
        },
      }))
      .mockResolvedValueOnce(Response.json({ username: "김토스" }))
      .mockResolvedValueOnce(Response.json({ ok: true }))
      .mockResolvedValueOnce(Response.json({ redirectUrl: "/login" }))
      .mockResolvedValueOnce(Response.json({ afterSignout: true }));
    const { call } = setup(fetchImpl);
    const login = await call({
      method: "POST",
      path: "/api/v1/signin",
      body: { email: "kim@toss.im", password: "test-password" },
    });
    expect(JSON.stringify(login)).not.toContain("secret-token");
    const me = await call({ path: "/api/v1/me" });
    expect(me.structuredContent.data).toEqual({ username: "김토스" });
    expect(fetchImpl.mock.calls[1][1].headers.get("cookie")).toBe("jwt=secret-token");

    await call({ path: "/api/v1/rooms", useSession: false });
    expect(fetchImpl.mock.calls[2][1].headers.get("cookie")).toBeNull();

    await call({ method: "POST", path: "/api/v1/signout" });
    await call({ path: "/api/v1/me" });
    expect(fetchImpl.mock.calls[4][1].headers.get("cookie")).toBeNull();
  });

  it("다른 출처와 상위 경로, 인코딩 우회를 차단한다", async () => {
    const fetchImpl = vi.fn();
    const { call } = setup(fetchImpl);
    for (const path of [
      "http://example.com/api/health",
      "//example.com/api/health",
      "/api/../admin",
      "/api/%2e%2e/private",
      "/api/%2F%2Fexample.com",
      "/api/health?next=evil",
      "/api\\health",
      "/admin",
    ]) {
      await expect(call({ path })).rejects.toThrow();
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("등록되지 않은 프로젝트 및 외부 주소 설정을 거부한다", async () => {
    const fetchImpl = vi.fn();
    await expect(setup(fetchImpl, null).call({ path: "/api/health" })).rejects.toThrow();
    await expect(setup(fetchImpl, "https://example.com").call({ path: "/api/health" })).rejects.toThrow();
    await expect(setup(fetchImpl, "http://127.0.0.1:3000/custom").call({ path: "/api/health" })).rejects.toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("Host/Cookie 헤더 직접 설정과 GET body를 차단한다", async () => {
    const fetchImpl = vi.fn();
    const { call } = setup(fetchImpl);
    await expect(call({ path: "/api/health", headers: { Host: "example.com" } })).rejects.toThrow();
    await expect(call({ path: "/api/health", headers: { Cookie: "jwt=stolen" } })).rejects.toThrow();
    await expect(call({ path: "/api/health", body: {} })).rejects.toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("JSON body와 API Key Authorization 헤더를 전달한다", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ success: true }, { status: 201 }));
    const { call } = setup(fetchImpl);
    const result = await call({
      method: "POST",
      path: "/api/v1/reservation",
      headers: { Authorization: "Bearer sample-key" },
      body: { roomId: 1, title: "테스트 예약" },
    });
    const options = fetchImpl.mock.calls[0][1];
    expect(options.body).toBe(JSON.stringify({ roomId: 1, title: "테스트 예약" }));
    expect(options.headers.get("authorization")).toBe("Bearer sample-key");
    expect(options.headers.get("content-type")).toBe("application/json");
    expect(result.structuredContent.status).toBe(201);
    expect(JSON.stringify(result)).not.toContain("sample-key");
  });

  it("리디렉션은 따르지 않고 4xx/5xx 상태도 반환한다", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, {
      status: 302,
      headers: { Location: "https://example.com/private" },
    }));
    const { call } = setup(fetchImpl);
    const result = await call({ path: "/api/health" });
    expect(result.structuredContent).toMatchObject({ status: 302, ok: false });
    expect(fetchImpl.mock.calls[0][1].redirect).toBe("manual");
    fetchImpl.mockImplementationOnce(async () => Response.json({ message: "Unauthorized" }, { status: 403 }));
    const forbidden = await call({ path: "/api/v1/me" });
    expect(forbidden.structuredContent).toMatchObject({
      status: 403, ok: false, data: { message: "Unauthorized" },
    });
  });

  it("응답 데이터가 1 MiB를 초과하면 잘라 반환한다", async () => {
    const fetchImpl = vi.fn(async () => new Response("x".repeat(1024 * 1024 + 10)));
    const { call } = setup(fetchImpl);
    const result = await call({ path: "/api/health" });
    expect(result.structuredContent.truncated).toBe(true);
    expect(result.structuredContent.data.length).toBe(1024 * 1024);
  });

  it("요청 body가 1 MiB를 초과하면 전송하지 않는다", async () => {
    const fetchImpl = vi.fn();
    const { call } = setup(fetchImpl);
    await expect(call({ method: "POST", path: "/api/v1/reservation", body: { big: "x".repeat(1024 * 1024) } }))
      .rejects.toThrow("1 MiB");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
