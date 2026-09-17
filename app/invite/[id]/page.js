"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { weddingFunctions } from "../../data/functions";
import { supabase } from "../../supabase";

function Countdown({ dateTime }) {
  const calculateTimeLeft = () => {
    const difference = new Date(dateTime).getTime() - new Date().getTime();

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
  }, [dateTime]);

  return (
    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
      {[
        ["Days", timeLeft.days],
        ["Hours", timeLeft.hours],
        ["Minutes", timeLeft.minutes],
        ["Seconds", timeLeft.seconds],
      ].map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-[#c9a45c]/40 bg-white/70 p-2"
        >
          <div className="text-xl font-semibold text-[#6b1f32]">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function createCalendarFile(event) {
  const start = new Date(event.dateTime);

  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Shailey & Deep Wedding//EN
BEGIN:VEVENT
UID:${event.id}@shaileydeepwedding.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${event.name} - SHAILEY & DEEP
LOCATION:${event.venue}, ${event.address}
DESCRIPTION:Wedding function of SHAILEY & DEEP
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], {
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

export default function GuestInvitation() {
  const params = useParams();
  const invitationId = params?.id;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [screen, setScreen] = useState("opening");
  const [selectedFunction, setSelectedFunction] = useState(null);

  const [rsvpName, setRsvpName] = useState("");
  const [attending, setAttending] = useState(null);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("");
  const [rsvpSaving, setRsvpSaving] = useState(false);

  useEffect(() => {
    if (!invitationId) return;

    async function loadInvitation() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("invitations")
        .select(
          "invitation_id, guest_name, guest_count, invitation_type, selected_functions"
        )
        .eq("invitation_id", invitationId)
        .single();

      if (fetchError) {
        console.error(fetchError);
        setError("Invitation not found.");
        setLoading(false);
        return;
      }

      setInvitation(data);
      setRsvpName(data.guest_name || "");
      setLoading(false);
    }

    loadInvitation();
  }, [invitationId]);

  const guestFunctions = useMemo(() => {
    if (!invitation) return [];

    return weddingFunctions.filter((item) =>
      invitation.selected_functions?.includes(item.id)
    );
  }, [invitation]);

  async function submitRSVP() {
    if (!rsvpName.trim()) {
      setRsvpStatus("Please enter your name.");
      return;
    }

    if (attending === null) {
      setRsvpStatus("Please select whether you are attending.");
      return;
    }

    setRsvpSaving(true);
    setRsvpStatus("");

    const { error: rsvpError } = await supabase.from("rsvps").insert({
      invitation_id: invitationId,
      guest_name: rsvpName.trim(),
      attending,
      message: rsvpMessage.trim() || null,
    });

    setRsvpSaving(false);

    if (rsvpError) {
      console.error(rsvpError);
      setRsvpStatus("Something went wrong. Please try again.");
      return;
    }

    setRsvpStatus("Thank you! Your RSVP has been received.");
  }

  function shareInvitation() {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "SHAILEY & DEEP",
        text: `You are invited to the wedding of SHAILEY & DEEP.`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Invitation link copied!");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f1e7] px-6">
        <div className="text-center">
          <div className="text-3xl font-serif text-[#6b1f32]">
            SHAILEY & DEEP
          </div>
          <p className="mt-3 text-sm text-gray-500">Loading invitation...</p>
        </div>
      </main>
    );
  }

  if (error || !invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f1e7] px-6">
        <div className="rounded-2xl border border-[#c9a45c]/50 bg-white p-8 text-center shadow-lg">
          <div className="text-3xl font-serif text-[#6b1f32]">
            SHAILEY & DEEP
          </div>
          <p className="mt-4 text-gray-600">
            {error || "Invitation not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#4b2630]">
      <div className="mx-auto min-h-screen max-w-md overflow-hidden bg-[#fbf7f0] shadow-2xl">
        {/* OPENING */}
        {screen === "opening" && (
          <section className="flex min-h-screen flex-col items-center justify-center px-7 py-12 text-center">
            <div className="mb-8 text-5xl">🌸</div>

            <p className="text-xs uppercase tracking-[0.35em] text-[#9b7440]">
              You are cordially invited
            </p>

            <div className="my-7 h-px w-32 bg-[#c9a45c]" />

            <p className="text-lg text-gray-600">
              Dear{" "}
              <span className="font-semibold text-[#6b1f32]">
                {invitation.guest_name}
              </span>
            </p>

            <h1 className="mt-6 font-serif text-5xl leading-tight text-[#6b1f32]">
              SHAILEY
              <span className="block text-2xl text-[#b18a4a]">&</span>
              DEEP
            </h1>

            <p className="mt-7 max-w-xs text-sm leading-6 text-gray-600">
              With the blessings of our families, we invite you to celebrate
              our wedding celebrations with us.
            </p>

            <div className="mt-8 rounded-full border border-[#c9a45c]/50 bg-white px-6 py-3 text-sm text-[#6b1f32]">
              {invitation.guest_count}{" "}
              {Number(invitation.guest_count) === 1 ? "Guest" : "Guests"}
            </div>

            <button
              onClick={() => setScreen("home")}
              className="mt-10 rounded-full bg-[#6b1f32] px-9 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-[#551728]"
            >
              Open Invitation
            </button>
          </section>
        )}

        {/* HOME */}
        {screen === "home" && (
          <section className="min-h-screen px-5 py-8">
            <div className="text-center">
              <div className="text-3xl">🌸</div>

              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#9b7440]">
                Wedding Invitation
              </p>

              <h1 className="mt-4 font-serif text-4xl text-[#6b1f32]">
                SHAILEY & DEEP
              </h1>

              <p className="mt-3 text-sm text-gray-600">
                Dear {invitation.guest_name}, we would be delighted to have
                you celebrate with us.
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-[#c9a45c]/40 bg-white p-5 shadow-sm">
              <p className="text-center text-xs uppercase tracking-[0.25em] text-[#9b7440]">
                Your Invitation
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f8f1e7] p-4 text-center">
                  <div className="text-2xl font-semibold text-[#6b1f32]">
                    {invitation.guest_count}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Guests</div>
                </div>

                <div className="rounded-2xl bg-[#f8f1e7] p-4 text-center">
                  <div className="text-2xl font-semibold text-[#6b1f32]">
                    {guestFunctions.length}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Functions</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setScreen("functions")}
              className="mt-7 w-full rounded-full bg-[#6b1f32] px-6 py-3 text-sm font-medium text-white shadow-lg"
            >
              View Wedding Functions
            </button>

            <button
              onClick={() => setScreen("rsvp")}
              className="mt-3 w-full rounded-full border border-[#6b1f32] px-6 py-3 text-sm font-medium text-[#6b1f32]"
            >
              RSVP
            </button>

            <button
              onClick={shareInvitation}
              className="mt-3 w-full rounded-full border border-[#c9a45c] px-6 py-3 text-sm font-medium text-[#8a6636]"
            >
              Share Invitation
            </button>
          </section>
        )}

        {/* FUNCTIONS */}
        {screen === "functions" && (
          <section className="min-h-screen px-5 py-8">
            <button
              onClick={() => setScreen("home")}
              className="mb-6 text-sm text-[#8a6636]"
            >
              ← Back
            </button>

            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9b7440]">
                Your Celebrations
              </p>

              <h2 className="mt-3 font-serif text-4xl text-[#6b1f32]">
                Wedding Functions
              </h2>
            </div>

            <div className="mt-8 space-y-4">
              {guestFunctions.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedFunction(event);
                    setScreen("details");
                  }}
                  className="w-full rounded-3xl border border-[#c9a45c]/40 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl text-[#6b1f32]">
                        {event.name}
                      </h3>

                      <p className="mt-2 text-sm text-gray-600">
                        {event.date}
                      </p>

                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>

                    <div className="text-2xl text-[#c9a45c]">✦</div>
                  </div>

                  <div className="mt-4 text-xs text-[#8a6636]">
                    View details →
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setScreen("rsvp")}
              className="mt-7 w-full rounded-full bg-[#6b1f32] px-6 py-3 text-sm font-medium text-white"
            >
              RSVP
            </button>
          </section>
        )}

        {/* FUNCTION DETAILS */}
        {screen === "details" && selectedFunction && (
          <section className="min-h-screen px-5 py-8">
            <button
              onClick={() => setScreen("functions")}
              className="mb-6 text-sm text-[#8a6636]"
            >
              ← All Functions
            </button>

            <div className="rounded-3xl border border-[#c9a45c]/40 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="text-3xl text-[#c9a45c]">✦</div>

                <h2 className="mt-3 font-serif text-4xl text-[#6b1f32]">
                  {selectedFunction.name}
                </h2>

                <p className="mt-4 text-sm text-gray-600">
                  {selectedFunction.date}
                </p>

                <p className="text-sm text-gray-600">
                  {selectedFunction.time}
                </p>
              </div>

              <Countdown dateTime={selectedFunction.dateTime} />

              <div className="mt-7 rounded-2xl bg-[#f8f1e7] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9b7440]">
                  Venue
                </p>

                <h3 className="mt-2 font-serif text-xl text-[#6b1f32]">
                  {selectedFunction.venue}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selectedFunction.address}
                </p>

                <a
                  href={selectedFunction.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-full bg-[#6b1f32] px-5 py-2 text-xs font-medium text-white"
                >
                  Open Google Maps
                </a>
              </div>

              <button
                onClick={() => createCalendarFile(selectedFunction)}
                className="mt-4 w-full rounded-full border border-[#c9a45c] px-5 py-3 text-sm font-medium text-[#8a6636]"
              >
                Add to Calendar
              </button>
            </div>
          </section>
        )}

        {/* RSVP */}
        {screen === "rsvp" && (
          <section className="min-h-screen px-5 py-8">
            <button
              onClick={() => setScreen("home")}
              className="mb-6 text-sm text-[#8a6636]"
            >
              ← Back
            </button>

            <div className="text-center">
              <div className="text-3xl">🌸</div>

              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#9b7440]">
                Kindly Respond
              </p>

              <h2 className="mt-3 font-serif text-4xl text-[#6b1f32]">
                RSVP
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
                Please let us know whether you will be joining SHAILEY & DEEP
                for their wedding celebrations.
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-[#c9a45c]/40 bg-white p-6 shadow-sm">
              <label className="text-xs uppercase tracking-[0.2em] text-[#9b7440]">
                Your Name
              </label>

              <input
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                placeholder="Enter your name"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
              />

              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[#9b7440]">
                Will you attend?
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAttending(true)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    attending === true
                      ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                      : "border-gray-200 bg-white text-[#6b1f32]"
                  }`}
                >
                  Yes, I’ll Attend
                </button>

                <button
                  onClick={() => setAttending(false)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    attending === false
                      ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                      : "border-gray-200 bg-white text-[#6b1f32]"
                  }`}
                >
                  Sorry, Can't
                </button>
              </div>

              <label className="mt-6 block text-xs uppercase tracking-[0.2em] text-[#9b7440]">
                Message (Optional)
              </label>

              <textarea
                value={rsvpMessage}
                onChange={(e) => setRsvpMessage(e.target.value)}
                placeholder="Add a message for the couple..."
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
              />

              <button
                onClick={submitRSVP}
                disabled={rsvpSaving}
                className="mt-5 w-full rounded-full bg-[#6b1f32] px-6 py-3 text-sm font-medium text-white shadow-lg disabled:opacity-60"
              >
                {rsvpSaving ? "Sending RSVP..." : "Send RSVP"}
              </button>

              {rsvpStatus && (
                <p
                  className={`mt-4 text-center text-sm ${
                    rsvpStatus.includes("Thank you")
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {rsvpStatus}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}