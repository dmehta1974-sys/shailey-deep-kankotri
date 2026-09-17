"use client";

import { useEffect, useState } from "react";
import { weddingFunctions } from "./data/functions";

function Countdown({ dateTime }) {
  const calculateTime = () => {
    const difference = new Date(dateTime).getTime() - Date.now();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [dateTime]);

  return (
    <div className="mt-5 grid grid-cols-4 gap-2">
      {[
        ["Days", timeLeft.days],
        ["Hours", timeLeft.hours],
        ["Minutes", timeLeft.minutes],
        ["Seconds", timeLeft.seconds],
      ].map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-[#b89a5a]/40 bg-[#f8f1e7]/70 px-2 py-3 text-center"
        >
          <div className="font-serif text-xl">
            {String(value).padStart(2, "0")}
          </div>

          <div className="mt-1 text-[8px] uppercase tracking-[0.12em] text-[#8a6870]">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function FunctionDetails({ event, onBack }) {
  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#5b1f2a]">
      <section className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-md text-center">

          <p className="text-xs uppercase tracking-[0.35em] text-[#9a7b3f]">
            SHAILEY & DEEP
          </p>

          <div className="mx-auto my-6 h-px w-20 bg-[#b89a5a]" />

          <p className="text-xs uppercase tracking-[0.25em] text-[#9a7b3f]">
            Wedding Celebration
          </p>

          <h1 className="mt-4 font-serif text-5xl">
            {event.name}
          </h1>

          <p className="mt-5 font-serif text-lg italic text-[#7d4a54]">
            We would love to celebrate this special moment with you
          </p>

          <div className="mt-9">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9a7b3f]">
              Countdown
            </p>

            <Countdown dateTime={event.dateTime} />
          </div>

          <div className="mt-8 rounded-2xl border border-[#b89a5a]/60 bg-white/50 p-7 text-left shadow-sm">

            <div className="border-b border-[#b89a5a]/30 pb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9a7b3f]">
                Date
              </p>

              <p className="mt-2 font-serif text-xl">
                {event.date}
              </p>
            </div>

            <div className="border-b border-[#b89a5a]/30 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9a7b3f]">
                Time
              </p>

              <p className="mt-2 font-serif text-xl">
                {event.time}
              </p>
            </div>

            <div className="pt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9a7b3f]">
                Venue
              </p>

              <p className="mt-2 font-serif text-xl">
                {event.venue}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#7d4a54]">
                {event.address}
              </p>
            </div>

          </div>

          <div className="mt-7 flex flex-col gap-3">

            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full border border-[#9a7b3f] bg-[#6b2431] px-8 py-4 text-sm tracking-[0.15em] text-white shadow-lg transition hover:bg-[#571c27]"
            >
              VIEW VENUE
            </a>

            <button
              onClick={() => downloadCalendar(event)}
              className="rounded-full border border-[#9a7b3f] bg-transparent px-8 py-4 text-sm tracking-[0.15em] text-[#6b2431]"
            >
              ADD TO CALENDAR
            </button>

            <button
              onClick={onBack}
              className="mt-2 text-sm text-[#9a7b3f] underline underline-offset-4"
            >
              ← BACK TO CELEBRATIONS
            </button>

          </div>

        </div>
      </section>
    </main>
  );
}

function downloadCalendar(event) {
  const start = new Date(event.dateTime);

  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(".000Z", "Z");

  const calendarText = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Shailey and Deep//Wedding//EN
BEGIN:VEVENT
UID:${event.id}@shaileyanddeep
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${event.name} - SHAILEY & DEEP
LOCATION:${event.venue}, ${event.address}
DESCRIPTION:Wedding celebration of SHAILEY & DEEP
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([calendarText], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.id}.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function Home() {
  const [screen, setScreen] = useState("opening");
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (selectedEvent) {
    return (
      <FunctionDetails
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  if (screen === "functions") {
    return (
      <main className="min-h-screen bg-[#f8f1e7] text-[#5b1f2a]">
        <section className="px-6 py-12">
          <div className="mx-auto max-w-md text-center">

            <p className="text-xs uppercase tracking-[0.35em] text-[#9a7b3f]">
              SHAILEY & DEEP
            </p>

            <h1 className="mt-5 font-serif text-4xl">
              Wedding Celebrations
            </h1>

            <div className="mx-auto my-6 h-px w-20 bg-[#b89a5a]" />

            <p className="font-serif text-lg italic text-[#7d4a54]">
              Join us as we celebrate our special moments
            </p>

            <div className="mt-9 space-y-5">

              {weddingFunctions.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full rounded-2xl border border-[#b89a5a]/60 bg-white/50 p-6 text-left shadow-sm transition hover:bg-white/70"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7b3f]">
                    Celebration
                  </p>

                  <h2 className="mt-2 font-serif text-2xl">
                    {event.name}
                  </h2>

                  <p className="mt-2 text-sm text-[#7d4a54]">
                    {event.date} · {event.time}
                  </p>

                  <p className="mt-1 text-sm text-[#7d4a54]">
                    {event.venue}
                  </p>

                  <Countdown dateTime={event.dateTime} />

                  <p className="mt-4 text-xs tracking-[0.12em] text-[#9a7b3f]">
                    TAP TO VIEW DETAILS →
                  </p>
                </button>
              ))}

            </div>

            <button
              onClick={() => setScreen("home")}
              className="mt-8 text-sm text-[#9a7b3f] underline underline-offset-4"
            >
              ← BACK
            </button>

          </div>
        </section>
      </main>
    );
  }

  if (screen === "home") {
    return (
      <main className="min-h-screen bg-[#f8f1e7] text-[#5b1f2a]">
        <section className="relative min-h-screen overflow-hidden px-6 py-12">

          <div className="absolute left-0 top-0 h-44 w-44 rounded-br-full border-b border-r border-[#b89a5a]/50" />

          <div className="absolute bottom-0 right-0 h-44 w-44 rounded-tl-full border-l border-t border-[#b89a5a]/50" />

          <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center text-center">

            <p className="text-xs uppercase tracking-[0.35em] text-[#9a7b3f]">
              Welcome
            </p>

            <div className="my-6 h-px w-20 bg-[#b89a5a]" />

            <h1 className="font-serif text-5xl tracking-wide">
              SHAILEY
            </h1>

            <p className="my-2 text-2xl text-[#b89a5a]">
              &
            </p>

            <h1 className="font-serif text-5xl tracking-wide">
              DEEP
            </h1>

            <p className="mt-7 font-serif text-xl italic">
              are getting married
            </p>

            <p className="mt-3 text-sm uppercase tracking-[0.25em] text-[#7d4a54]">
              25 — 29 November 2026
            </p>

            <p className="mt-5 max-w-sm text-sm leading-6 text-[#7d4a54]">
              Five beautiful days of love, family,
              music and celebration.
            </p>

            <button
              onClick={() => setScreen("functions")}
              className="mt-10 rounded-full border border-[#9a7b3f] bg-[#6b2431] px-8 py-4 text-sm tracking-[0.18em] text-white shadow-lg transition hover:bg-[#571c27]"
            >
              VIEW CELEBRATIONS
            </button>

          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#5b1f2a]">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">

        <div className="absolute left-0 top-0 h-40 w-40 rounded-br-full border-b border-r border-[#b89a5a]/50" />

        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-tl-full border-l border-t border-[#b89a5a]/50" />

        <div className="relative z-10 w-full max-w-md text-center">

          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-[#9a7b3f]">
            Together with their families
          </p>

          <div className="mx-auto mb-8 h-px w-24 bg-[#b89a5a]" />

          <p className="mb-5 text-sm tracking-[0.3em]">
            With joy in their hearts
          </p>

          <h1 className="font-serif text-5xl tracking-wide leading-tight">
            SHAILEY
          </h1>

          <p className="my-3 text-2xl text-[#b89a5a]">
            &
          </p>

          <h1 className="font-serif text-5xl tracking-wide leading-tight">
            DEEP
          </h1>

          <div className="mx-auto my-9 h-px w-24 bg-[#b89a5a]" />

          <p className="font-serif text-xl italic">
            request the pleasure of your presence
          </p>

          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-[#7d4a54]">
            at their wedding celebrations
          </p>

          <button
            onClick={() => setScreen("home")}
            className="mt-12 rounded-full border border-[#9a7b3f] bg-[#6b2431] px-9 py-4 text-sm font-medium tracking-[0.18em] text-white shadow-lg transition hover:bg-[#571c27]"
          >
            OPEN INVITATION
          </button>

        </div>
      </section>
    </main>
  );
}