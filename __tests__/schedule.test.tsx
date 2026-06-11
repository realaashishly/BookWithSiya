import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildMockPayload, getMockDates } from "./mockData";
import { mockPush } from "./setup";
import Page from "@/app/schedule/page";

function createDeferred() {
  let resolve!: (v: unknown) => void;
  let reject!: (v: unknown) => void;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

/** Render and wait until the slot grid appears */
async function renderAndWait() {
  const deferred = createDeferred();
  vi.mocked(fetch).mockReturnValue(deferred.promise as Promise<Response>);

  render(<Page />);

  expect(screen.getByTestId("skeleton-loader")).toBeInTheDocument();

  const payload = buildMockPayload();
  await act(async () => {
    deferred.resolve({ ok: true, json: async () => payload });
  });

  await waitFor(() => {
    expect(screen.getByTestId("slot-grid")).toBeInTheDocument();
  });

  return payload;
}

// ─────────────────────────────────────────────────────────
// Suite A: Initialization & Data Hydration
// ─────────────────────────────────────────────────────────
describe("Suite A: Initialization & Data Hydration", () => {
  it("A1: shows skeleton loader while fetching", async () => {
    const deferred = createDeferred();
    vi.mocked(fetch).mockReturnValue(deferred.promise as Promise<Response>);

    render(<Page />);

    expect(screen.getByTestId("skeleton-loader")).toBeInTheDocument();
    expect(screen.queryByTestId("slot-grid")).not.toBeInTheDocument();
  });

  it("A2: defaults active tab to Today and renders its slots", async () => {
    const payload = await renderAndWait();
    const dates = getMockDates();
    const todayLabel = `Today, ${new Date(dates.today).toLocaleString("en-US", { month: "short" })} ${new Date(dates.today).getDate()}`;

    const todayBtn = screen.getByRole("button", { name: todayLabel });
    expect(todayBtn.className).toContain("bg-white");

    const todaySlots = payload.scheduleByDate[dates.today];
    for (const slot of todaySlots) {
      expect(screen.getByText(slot.time)).toBeInTheDocument();
    }
  });

  it("A3: hero CTA shows earliest available time", async () => {
    await renderAndWait();

    const heroBtns = screen.getAllByText(/10:30 PM/);
    expect(heroBtns.length).toBeGreaterThan(0);

    expect(screen.getByText("Secure your spot now →")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────
// Suite B: Tab Navigation & State Updates
// ─────────────────────────────────────────────────────────
describe("Suite B: Tab Navigation & State Updates", () => {
  function getTabLabel(dateStr: string, offset: 0 | 1 | 2): string {
    const d = new Date(dateStr);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    if (offset === 0) return `Today, ${month} ${day}`;
    if (offset === 1) return `Tomorrow, ${month} ${day}`;
    const weekday = d.toLocaleString("en-US", { weekday: "short" });
    return `${weekday}, ${month} ${day}`;
  }

  it("B1: clicking Tomorrow tab switches grid and highlights it", async () => {
    const payload = await renderAndWait();
    const dates = getMockDates();
    const tomorrowLabel = getTabLabel(dates.tomorrow, 1);

    const tomorrowTab = screen.getByRole("button", { name: tomorrowLabel });
    await act(async () => {
      await userEvent.click(tomorrowTab);
    });

    expect(tomorrowTab.className).toContain("bg-white");

    const tomorrowSlots = payload.scheduleByDate[dates.tomorrow];
    for (const slot of tomorrowSlots) {
      expect(screen.getByText(slot.time)).toBeInTheDocument();
    }
  });

  it("B2: rendered slot count matches Tomorrow array length", async () => {
    const payload = await renderAndWait();
    const dates = getMockDates();
    const tomorrowLabel = getTabLabel(dates.tomorrow, 1);

    const tomorrowTab = screen.getByRole("button", { name: tomorrowLabel });
    await act(async () => {
      await userEvent.click(tomorrowTab);
    });

    const slotButtons = screen.getAllByTestId(/^slot-\d/);
    expect(slotButtons).toHaveLength(payload.scheduleByDate[dates.tomorrow].length);
  });
});

// ─────────────────────────────────────────────────────────
// Suite C: Conditional Grid UI
// ─────────────────────────────────────────────────────────
describe("Suite C: Conditional Grid UI", () => {
  it("C1: available slot shows green '2 Spots Open' badge and is clickable", async () => {
    await renderAndWait();

    const badge = screen.getByText("2 Spots Open");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("emerald");

    const slotBtn = badge.closest("button")!;
    expect(slotBtn).not.toBeDisabled();
  });

  it("C2: full slot shows amber 'Join Waitlist' and is present", async () => {
    await renderAndWait();

    const badge = screen.getByText("Join Waitlist");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("amber");
  });

  it("C3: past-slot times are absent from the DOM", async () => {
    await renderAndWait();
    expect(screen.queryByText(/09:00 AM/)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────
// Suite D: Checkout Pipeline & Interactions
// ─────────────────────────────────────────────────────────
describe("Suite D: Checkout Pipeline & Interactions", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  it("D1: clicking an available slot shows spinner and disables other slots", async () => {
    const orderDeferred = createDeferred();
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => buildMockPayload() })
      .mockReturnValueOnce(orderDeferred.promise as Promise<Response>);

    render(<Page />);
    await waitFor(() => expect(screen.getByTestId("slot-grid")).toBeInTheDocument());

    const slot = screen.getByText("10:30 PM").closest("button")!;
    await act(async () => {
      await userEvent.click(slot);
    });

    // spinner replaces content for the clicked slot
    expect(screen.getByTestId("slot-10-30-PM").querySelector(".animate-spin")).toBeInTheDocument();

    // other slots get disabled
    const otherSlots = screen.getAllByTestId(/^slot-\d/).filter(
      (b) => b.getAttribute("data-testid") !== "slot-10-30-PM",
    );
    for (const btn of otherSlots) {
      expect(btn).toBeDisabled();
    }
  });

  it("D2: dispatches POST to /api/payments/create-order with slot data", async () => {
    const orderDeferred = createDeferred();
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => buildMockPayload() })
      .mockReturnValueOnce(orderDeferred.promise as Promise<Response>);

    render(<Page />);
    await waitFor(() => expect(screen.getByTestId("slot-grid")).toBeInTheDocument());

    const slot = screen.getByText("10:30 PM").closest("button")!;
    await act(async () => {
      await userEvent.click(slot);
    });

    const calls = vi.mocked(fetch).mock.calls;
    const paymentCall = calls.find(([url]) =>
      (url as string).includes("/api/payments/create-order"),
    );
    expect(paymentCall).toBeDefined();

    const [, opts] = paymentCall as [string, RequestInit];
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body as string);
    expect(body.igAccountId).toBe("test-creator-id");
    expect(body.scheduledTime).toBe("10:30 PM");
  });

  it("D3: on successful payment navigates to /success", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => buildMockPayload() })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ payment_session_id: "test_session_123" }),
      });

    render(<Page />);
    await waitFor(() => expect(screen.getByTestId("slot-grid")).toBeInTheDocument());

    const slot = screen.getByText("10:30 PM").closest("button")!;
    await act(async () => {
      await userEvent.click(slot);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/success?igId=test-creator-id");
    });
  });
});

// ─────────────────────────────────────────────────────────
// Suite E: Error Boundaries & Edge Cases
// ─────────────────────────────────────────────────────────
describe("Suite E: Error Boundaries & Edge Cases", () => {
  it("E1: API failure shows error fallback with Refresh button", async () => {
    const deferred = createDeferred();
    vi.mocked(fetch).mockReturnValue(deferred.promise as Promise<Response>);

    render(<Page />);

    await act(async () => {
      deferred.reject(new Error("Network failure"));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load current slots. Please refresh to try again."),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("E2: payment cancellation resets processing state and shows toast", async () => {
    const { load } = await import("@cashfreepayments/cashfree-js");
    vi.mocked(load).mockResolvedValue({
      checkout: vi.fn().mockResolvedValue({ error: { message: "Payment was canceled." } }),
    });

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => buildMockPayload() })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ payment_session_id: "test_session_123" }),
      });

    render(<Page />);
    await waitFor(() => expect(screen.getByTestId("slot-grid")).toBeInTheDocument());

    const slot = screen.getByText("10:30 PM").closest("button")!;
    await act(async () => {
      await userEvent.click(slot);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("slot-10-30-PM").querySelector(".animate-spin"),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Payment was canceled.")).toBeInTheDocument();
  });
});
