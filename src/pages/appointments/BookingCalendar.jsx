import { useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function BookingCalendar({ value, onChange, disabledDates }) {
  const unavailable = disabledDates instanceof Set ? disabledDates : new Set(disabledDates || []);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initial = value ? new Date(value + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isPast = (d) => {
    const cellDate = new Date(viewYear, viewMonth, d);
    cellDate.setHours(0, 0, 0, 0);
    return cellDate < today;
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Don't let the person navigate to a month entirely in the past.
  const atEarliestMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="booking-cal">
      <div className="booking-cal-header">
        <button type="button" className="booking-cal-nav" onClick={goPrevMonth} disabled={atEarliestMonth} aria-label="Previous month">
          ‹
        </button>
        <span className="booking-cal-title">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" className="booking-cal-nav" onClick={goNextMonth} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="booking-cal-weekdays">
        {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="booking-cal-grid">
        {cells.map((d, idx) => {
          if (d === null) return <span key={idx} className="booking-cal-cell empty" />;
          const dateStr = toDateStr(viewYear, viewMonth, d);
          const isUnavailable = unavailable.has(dateStr);
          const disabled = isPast(d) || isUnavailable;
          const isSelected = value === dateStr;
          const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button
              type="button"
              key={idx}
              disabled={disabled}
              onClick={() => onChange(dateStr)}
              title={isUnavailable ? "Doctor unavailable this day" : undefined}
              className={`booking-cal-cell ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${disabled ? "disabled" : ""} ${isUnavailable ? "unavailable" : ""}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}