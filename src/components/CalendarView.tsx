"use client";
import { useEffect, useState } from "react";
import type { EventDto } from "@/lib/api/events";
import { buildMonthGrid, dayKey, groupEventsByDay } from "@/components/calendarGrid";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month0, setMonth0] = useState(now.getUTCMonth());
  const [events, setEvents] = useState<EventDto[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((res) => { if (res.success) setEvents(res.data); })
      .catch(() => setMessage("Failed to load events"));
  }, []);

  const grid = buildMonthGrid(year, month0);
  const byDay = groupEventsByDay(events);
  const selectedEvents = selected ? byDay[selected] ?? [] : [];

  async function addToCalendar(sourceEventId: string) {
    setAdding(sourceEventId);
    setMessage(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceEventId }),
      });
      const json = await res.json();
      setMessage(json.success ? "Added to your calendar." : `Error: ${json.error}`);
    } catch {
      setMessage("Network error adding event.");
    } finally {
      setAdding(null);
    }
  }

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(year, month0 + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth0(d.getUTCMonth());
    setSelected(null);
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <button className="button" onClick={() => shiftMonth(-1)}>‹</button>
        <strong>{new Date(Date.UTC(year, month0, 1)).toLocaleString("en", { month: "long", year: "numeric", timeZone: "UTC" })}</strong>
        <button className="button" onClick={() => shiftMonth(1)}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ fontWeight: 600, textAlign: "center", padding: 4 }}>{w}</div>
        ))}
        {grid.map((d) => {
          const key = dayKey(d);
          const dayEvents = byDay[key] ?? [];
          const inMonth = d.getUTCMonth() === month0;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              style={{
                minHeight: 84, textAlign: "left", padding: 6, borderRadius: 6,
                border: selected === key ? "2px solid #4b2ec7" : "1px solid #e3e3ef",
                background: inMonth ? "#fff" : "#f0f0f5", cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 12, color: inMonth ? "#1a1a2e" : "#9a9ab0" }}>{d.getUTCDate()}</div>
              {dayEvents.slice(0, 3).map((e) => (
                <div key={e.sourceEventId} style={{ fontSize: 11, background: "#ece8fb", borderRadius: 4, padding: "1px 4px", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.title}
                </div>
              ))}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e3e3ef", borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>{selected}</h3>
          {selectedEvents.length === 0 && <p>No events.</p>}
          {selectedEvents.map((e) => (
            <div key={e.sourceEventId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f5" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{e.title}</div>
                {e.location && <div style={{ fontSize: 12, color: "#6a6a85" }}>{e.location}</div>}
              </div>
              <button className="button" disabled={adding === e.sourceEventId} onClick={() => addToCalendar(e.sourceEventId)}>
                {adding === e.sourceEventId ? "Adding…" : "Add to my calendar"}
              </button>
            </div>
          ))}
        </div>
      )}

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
