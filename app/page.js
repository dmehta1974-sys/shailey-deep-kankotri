"use client";

import { useEffect, useState } from "react";
import { weddingFunctions } from "./data/functions";

function Countdown({ targetDate }) {
  const calculateTimeLeft = () => {
    const difference =
      new Date(targetDate).getTime() - new Date().getTime();

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

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {[
        ["DAYS", timeLeft.days],
        ["HOURS", timeLeft.hours],
        ["MIN", timeLeft.minutes],
        ["SEC", timeLeft.seconds],
      ].map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-[#d7c08a] bg-white/70 px-1 py-2"
        >
          <div className="font-serif text-lg font-semibold text-[#6b2431]">
            {String(value).padStart(2, "0")}
          </div>

          <div className="text-[8px] tracking-[0.12em] text-[#876d45]">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function FunctionDetails({ item, setScreen }) {
  return (
    <div className="min-h-screen bg-[#f8f1e7] px-4 py-6 text-[#5b1f2a]">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => setScreen("functions")}
          className="mb-5 text-xs tracking-[0.18em] text-[#8a6b3d]"
        >
          ← BACK
        </button>

        <div className="rounded-2xl border border-[#c9a85d] bg-[#fffaf3] p-5 shadow-sm">
          <p className="text-center text-xs tracking-[0.2em] text-[#8a6b3d]">
            WEDDING CELEBRATION
          </p>

          <h2 className="mt-2 text-center font-serif text-3xl">
            {item.name}
          </h2>

          <div className="mt-5">
            <p className="text-sm font-semibold">DATE</p>
            <p className="mt-1 text-sm">{item.date}</p>

            <p className="mt-4 text-sm font-semibold">TIME</p>
            <p className="mt-1 text-sm">{item.time}</p>

            <p className="mt-4 text-sm font-semibold">VENUE</p>
            <p className="mt-1 text-sm">{item.venue}</p>

            <p className="mt-2 text-xs leading-5 text-[#765c4c]">
              {item.address}
            </p>
          </div>

          <Countdown targetDate={item.dateTime} />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <a
              href={item.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#b89452] bg-[#6b2431] px-3 py-3 text-center text-[10px] font-semibold tracking-[0.12em] text-white"
            >
              VIEW VENUE
            </a>

            <button
              onClick={() => downloadCalendar(item)}
              className="rounded-full border border-[#b89452] bg-[#fffaf3] px-3 py-3 text-[10px] font-semibold tracking-[0.12em] text-[#6b2431]"
            >
              ADD TO CALENDAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function downloadCalendar(item) {
  const start = new Date(item.dateTime);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  };

  const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Shailey Deep Kankotri//EN
BEGIN:VEVENT
UID:${item.id}@shaileydeepkankotri
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${item.name} - SHAILEY & DEEP
LOCATION:${item.venue}, ${item.address}
DESCRIPTION:Wedding celebration of SHAILEY & DEEP
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([calendar], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${item.id}-shailey-deep.ics`;
  link.click();

  URL.revokeObjectURL(url);
}

export default function Home() {
  const [screen, setScreen] = useState("opening");
  const [selectedFunction, setSelectedFunction] = useState(null);

  if (screen === "opening") {
    return (
      <main className="h-[100dvh] overflow-hidden bg-[#f8f1e7] text-[#5b1f2a]">
        <section className="relative h-[100dvh] overflow-hidden px-3 py-3 sm:px-6 sm:py-5">

          {/* Outer decorative borders */}
          <div className="pointer-events-none absolute inset-2 rounded-[24px] border border-[#c9a85d]" />
          <div className="pointer-events-none absolute inset-4 rounded-[20px] border border-[#dfca9a]" />

          {/* Decorative flowers */}
          <div className="pointer-events-none absolute -left-7 top-8 text-5xl opacity-50">
            🌸
          </div>

          <div className="pointer-events-none absolute -right-7 top-16 text-5xl opacity-50">
            🌸
          </div>

          <div className="pointer-events-none absolute -bottom-5 left-3 text-4xl opacity-40">
            🌿
          </div>

          <div className="pointer-events-none absolute -bottom-4 right-3 text-4xl opacity-40">
            🌿
          </div>

          {/* Invitation content */}
          <div className="relative z-10 mx-auto flex h-full w-full max-w-lg flex-col justify-center text-center">

            {/* Gujarati blessings */}
            <div className="mb-3 grid grid-cols-3 items-center gap-1 text-[#6b2431]">
              <div>
                <p className="font-serif text-[13px] leading-5">
                  શ્રી ગણેશાય
                </p>
                <p className="font-serif text-[13px] leading-5">
                  નમઃ
                </p>
              </div>

              <div>
                <p className="font-serif text-[13px] leading-5">
                  શ્રી મહાવીરાય
                </p>
                <p className="font-serif text-[13px] leading-5">
                  નમઃ
                </p>
              </div>

              <div>
                <p className="font-serif text-[13px] leading-5">
                  શ્રી અંબે માતાય
                </p>
                <p className="font-serif text-[13px] leading-5">
                  નમઃ
                </p>
              </div>
            </div>

            {/* Gold divider */}
            <div className="mx-auto mb-3 h-px w-24 bg-[#c9a85d]" />

            {/* Together */}
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8a6b3d]">
              Together with their families
            </p>

            {/* SHAILEY */}
            <div className="mt-3">
              <h1 className="font-serif text-[42px] leading-none tracking-[0.08em] text-[#6b2431]">
                SHAILEY
              </h1>

              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[#876d45]">
                Daughter of
              </p>

              <p className="mt-1 text-[12px] leading-5">
                Preeti Deven Mehta
              </p>

              <p className="text-[11px] leading-4">
                &
              </p>

              <p className="text-[12px] leading-5">
                Deven Rohitbhai Mehta
              </p>

              <p className="text-[9px] text-[#876d45]">
                Rajkot
              </p>
            </div>

            {/* Couple ampersand */}
            <p className="my-2 font-serif text-2xl leading-none text-[#b89452]">
              &
            </p>

            {/* DEEP */}
            <div>
              <h1 className="font-serif text-[42px] leading-none tracking-[0.08em] text-[#6b2431]">
                DEEP
              </h1>

              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[#876d45]">
                Son of
              </p>

              <p className="mt-1 text-[12px] leading-5">
                Puja Nayan Pithwa
              </p>

              <p className="text-[11px] leading-4">
                &
              </p>

              <p className="text-[12px] leading-5">
                Nayan Kantibhai Pithwa
              </p>

              <p className="text-[9px] text-[#876d45]">
                Rajkot
              </p>
            </div>

            {/* Closing */}
            <div className="mt-3">
              <p className="font-serif text-[13px] italic leading-5">
                request the pleasure of your presence
              </p>

              <p className="mt-1 text-[9px] tracking-[0.12em]">
                at their wedding celebrations
              </p>

              <p className="mt-2 font-serif text-[13px] text-[#876d45]">
                25 — 29 November 2026
              </p>

              {/* Open invitation */}
              <button
                onClick={() => setScreen("home")}
                className="mt-3 rounded-full border border-[#b89452] bg-[#6b2431] px-7 py-3 text-[11px] font-semibold tracking-[0.2em] text-white shadow-md"
              >
                OPEN INVITATION →
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "home") {
    return (
      <main className="min-h-screen bg-[#f8f1e7] px-4 py-6 text-[#5b1f2a]">
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs tracking-[0.25em] text-[#8a6b3d]">
            WELCOME
          </p>

          <h1 className="mt-3 font-serif text-4xl tracking-[0.08em]">
            SHAILEY & DEEP
          </h1>

          <div className="mx-auto my-5 h-px w-24 bg-[#c9a85d]" />

          <p className="font-serif text-lg">
            are getting married
          </p>

          <p className="mt-2 text-sm text-[#765c4c]">
            25 — 29 November 2026
          </p>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#765c4c]">
            Five beautiful days filled with family, traditions, laughter and
            celebration.
          </p>

          <div className="mt-7 rounded-2xl border border-[#d7c08a] bg-[#fffaf3] p-5">
            <p className="text-xs tracking-[0.18em] text-[#8a6b3d]">
              OUR CELEBRATIONS
            </p>

            <button
              onClick={() => setScreen("functions")}
              className="mt-4 w-full rounded-full bg-[#6b2431] px-5 py-3 text-xs font-semibold tracking-[0.16em] text-white"
            >
              VIEW CELEBRATIONS
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (screen === "functions") {
    return (
      <main className="min-h-screen bg-[#f8f1e7] px-4 py-6 text-[#5b1f2a]">
        <div className="mx-auto max-w-md">
          <button
            onClick={() => setScreen("home")}
            className="mb-5 text-xs tracking-[0.18em] text-[#8a6b3d]"
          >
            ← BACK
          </button>

          <div className="text-center">
            <p className="text-xs tracking-[0.2em] text-[#8a6b3d]">
              WEDDING FUNCTIONS
            </p>

            <h1 className="mt-2 font-serif text-3xl">
              Our Celebrations
            </h1>
          </div>

          <div className="mt-5 space-y-3">
            {weddingFunctions.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedFunction(item);
                  setScreen("details");
                }}
                className="w-full rounded-2xl border border-[#d7c08a] bg-[#fffaf3] p-4 text-left shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-xs text-[#765c4c]">
                      {item.date} • {item.time}
                    </p>
                  </div>

                  <span className="text-lg text-[#b89452]">
                    →
                  </span>
                </div>

                <Countdown targetDate={item.dateTime} />
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (screen === "details" && selectedFunction) {
    return (
      <FunctionDetails
        item={selectedFunction}
        setScreen={setScreen}
      />
    );
  }

  return null;
}