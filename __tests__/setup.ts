import "@testing-library/jest-dom/vitest";
import { vi, beforeEach } from "vitest";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: vi.fn((key: string) => {
      const params: Record<string, string> = { igId: "test-creator-id" };
      return params[key] ?? null;
    }),
  }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@cashfreepayments/cashfree-js", () => ({
  load: vi.fn().mockResolvedValue({
    checkout: vi.fn().mockResolvedValue({ paymentDetails: { orderId: "test_order" } }),
  }),
}));

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({ className: "mock-jakarta" }),
}));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  mockPush.mockClear();
  vi.stubGlobal("process", {
    ...process,
    env: { ...process.env, NEXT_PUBLIC_API_URL: "http://localhost:3000" },
  });
});

export { mockPush };
