export function buildMockPayload() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  return {
    success: true,
    earliestAvailable: {
      id: "slot_today_immediate",
      date: fmt(today),
      time: "10:30 PM",
      isAvailable: true,
    },
    scheduleByDate: {
      [fmt(today)]: [
        { time: "10:15 PM", isAvailable: false, availableSlotsLeft: 0 },
        { time: "10:30 PM", isAvailable: true, availableSlotsLeft: 3 },
        { time: "10:45 PM", isAvailable: true, availableSlotsLeft: 2 },
        { time: "11:00 PM", isAvailable: true, availableSlotsLeft: 1 },
      ],
      [fmt(tomorrow)]: [
        { time: "12:00 AM", isAvailable: true, availableSlotsLeft: 3 },
        { time: "12:15 AM", isAvailable: true, availableSlotsLeft: 3 },
        { time: "12:30 AM", isAvailable: true, availableSlotsLeft: 2 },
      ],
      [fmt(dayAfter)]: [
        { time: "12:00 AM", isAvailable: true, availableSlotsLeft: 3 },
      ],
    },
  };
}

/** returns today/tomorrow/day-after date strings used in the payload */
export function getMockDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  return {
    today: today.toISOString().split("T")[0],
    tomorrow: tomorrow.toISOString().split("T")[0],
    dayAfter: dayAfter.toISOString().split("T")[0],
  };
}
