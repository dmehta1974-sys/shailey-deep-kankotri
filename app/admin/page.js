"use client";

import { useEffect, useMemo, useState } from "react";
import { weddingFunctions } from "../data/functions";
import { supabase } from "../supabase";

export default function AdminPage() {
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [invitationType, setInvitationType] = useState("full");
  const [selectedFunctions, setSelectedFunctions] = useState([]);

  const [createdLink, setCreatedLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const [invitations, setInvitations] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [invitationSearch, setInvitationSearch] = useState("");
  const [invitationFilter, setInvitationFilter] = useState("all");

  const [rsvpSearch, setRsvpSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState("all");

  const [editingInvitation, setEditingInvitation] = useState(null);
  const [editGuestName, setEditGuestName] = useState("");
  const [editGuestCount, setEditGuestCount] = useState(1);
  const [editInvitationType, setEditInvitationType] = useState("full");
  const [editSelectedFunctions, setEditSelectedFunctions] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoadingData(true);

    const [invitationsResult, rsvpsResult] = await Promise.all([
      supabase
        .from("invitations")
        .select(
          "invitation_id, guest_name, guest_count, invitation_type, selected_functions, created_at"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("rsvps")
        .select(
          "id, invitation_id, guest_name, attending, message, created_at"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (invitationsResult.error) {
      console.error(invitationsResult.error);
    }

    if (rsvpsResult.error) {
      console.error(rsvpsResult.error);
    }

    setInvitations(invitationsResult.data || []);
    setRsvps(rsvpsResult.data || []);

    setLoadingData(false);
  }

  function toggleFunction(functionId) {
    setSelectedFunctions((current) => {
      if (current.includes(functionId)) {
        return current.filter((id) => id !== functionId);
      }

      if (invitationType === "single") {
        return [functionId];
      }

      return [...current, functionId];
    });
  }

  function handleInvitationTypeChange(type) {
    setInvitationType(type);

    if (type === "full") {
      setSelectedFunctions(weddingFunctions.map((item) => item.id));
    } else {
      setSelectedFunctions([]);
    }
  }

  async function createInvitation() {
    setMessage("");
    setCreatedLink("");

    if (!guestName.trim()) {
      setMessage("Please enter a guest or family name.");
      return;
    }

    if (!guestCount || Number(guestCount) < 1) {
      setMessage("Guest count must be at least 1.");
      return;
    }

    if (invitationType === "custom" && selectedFunctions.length < 1) {
      setMessage("Please select at least one function.");
      return;
    }

    if (invitationType === "single" && selectedFunctions.length !== 1) {
      setMessage("Please select exactly one function.");
      return;
    }

    setCreating(true);

    const cleanName = guestName.trim();

    const invitationId =
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 7);

    const finalFunctions =
      invitationType === "full"
        ? weddingFunctions.map((item) => item.id)
        : selectedFunctions;

    const { error } = await supabase.from("invitations").insert({
      invitation_id: invitationId,
      guest_name: cleanName,
      guest_count: Number(guestCount),
      invitation_type: invitationType,
      selected_functions: finalFunctions,
    });

    setCreating(false);

    if (error) {
  console.error("SUPABASE INVITATION ERROR:", error);

  setMessage(
    `Could not create invitation: ${
      error.message || error.details || error.hint || "Unknown error"
    }`
  );

  return;
}

    const link = `${window.location.origin}/invite/${invitationId}`;

    setCreatedLink(link);
    setMessage("Invitation created successfully!");

    setGuestName("");
    setGuestCount(1);
    setInvitationType("full");
    setSelectedFunctions(weddingFunctions.map((item) => item.id));

    await loadAdminData();
  }

  async function copyLink(link) {
    try {
      await navigator.clipboard.writeText(link);
      setMessage("Invitation link copied!");
    } catch (error) {
      console.error(error);
      setMessage("Could not copy the link.");
    }
  }

  function shareWhatsApp(link, name) {
    const text = `You are invited to the wedding of SHAILEY & DEEP.\n\nDear ${name}, please open your personalized invitation:\n${link}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank");
  }

  function getFunctionNames(functionIds) {
    return (functionIds || [])
      .map((id) => weddingFunctions.find((item) => item.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  }

  function getInvitation(invitationId) {
    return invitations.find(
      (item) => item.invitation_id === invitationId
    );
  }

  function getInvitationName(invitationId) {
    const invitation = getInvitation(invitationId);

    return invitation?.guest_name || invitationId;
  }

  function getLatestRsvp(invitationId) {
    return rsvps.find(
      (rsvp) => rsvp.invitation_id === invitationId
    );
  }

  function startEditing(invitation) {
    setEditingInvitation(invitation);
    setEditGuestName(invitation.guest_name);
    setEditGuestCount(invitation.guest_count);
    setEditInvitationType(invitation.invitation_type);
    setEditSelectedFunctions(invitation.selected_functions || []);
    setEditMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingInvitation(null);
    setEditMessage("");
  }

  function toggleEditFunction(functionId) {
    setEditSelectedFunctions((current) => {
      if (current.includes(functionId)) {
        return current.filter((id) => id !== functionId);
      }

      if (editInvitationType === "single") {
        return [functionId];
      }

      return [...current, functionId];
    });
  }

  function handleEditTypeChange(type) {
    setEditInvitationType(type);

    if (type === "full") {
      setEditSelectedFunctions(
        weddingFunctions.map((item) => item.id)
      );
    } else {
      setEditSelectedFunctions([]);
    }
  }

  async function saveInvitationEdit() {
    setEditMessage("");

    if (!editGuestName.trim()) {
      setEditMessage("Please enter a guest or family name.");
      return;
    }

    if (!editGuestCount || Number(editGuestCount) < 1) {
      setEditMessage("Guest count must be at least 1.");
      return;
    }

    if (
      editInvitationType === "custom" &&
      editSelectedFunctions.length < 1
    ) {
      setEditMessage("Please select at least one function.");
      return;
    }

    if (
      editInvitationType === "single" &&
      editSelectedFunctions.length !== 1
    ) {
      setEditMessage("Please select exactly one function.");
      return;
    }

    setSavingEdit(true);

    const finalFunctions =
      editInvitationType === "full"
        ? weddingFunctions.map((item) => item.id)
        : editSelectedFunctions;

    const { error } = await supabase
      .from("invitations")
      .update({
        guest_name: editGuestName.trim(),
        guest_count: Number(editGuestCount),
        invitation_type: editInvitationType,
        selected_functions: finalFunctions,
      })
      .eq(
        "invitation_id",
        editingInvitation.invitation_id
      );

    setSavingEdit(false);

    if (error) {
      console.error(error);
      setEditMessage(
        "Could not update the invitation. Please try again."
      );
      return;
    }

    setEditMessage("Invitation updated successfully!");

    await loadAdminData();

    setTimeout(() => {
      setEditingInvitation(null);
      setEditMessage("");
    }, 1000);
  }

  const filteredInvitations = useMemo(() => {
    const search = invitationSearch.trim().toLowerCase();

    return invitations.filter((invitation) => {
      const matchesSearch =
        !search ||
        invitation.guest_name.toLowerCase().includes(search) ||
        invitation.invitation_id.toLowerCase().includes(search);

      const invitationRsvp = getLatestRsvp(
        invitation.invitation_id
      );

      let matchesFilter = true;

      if (invitationFilter === "attending") {
        matchesFilter = invitationRsvp?.attending === true;
      }

      if (invitationFilter === "not-attending") {
        matchesFilter = invitationRsvp?.attending === false;
      }

      if (invitationFilter === "no-response") {
        matchesFilter = !invitationRsvp;
      }

      return matchesSearch && matchesFilter;
    });
  }, [
    invitations,
    rsvps,
    invitationSearch,
    invitationFilter,
  ]);

  const filteredRsvps = useMemo(() => {
    const search = rsvpSearch.trim().toLowerCase();

    return rsvps.filter((rsvp) => {
      const invitationName = getInvitationName(
        rsvp.invitation_id
      );

      const matchesSearch =
        !search ||
        rsvp.guest_name.toLowerCase().includes(search) ||
        invitationName.toLowerCase().includes(search);

      let matchesFilter = true;

      if (rsvpFilter === "attending") {
        matchesFilter = rsvp.attending === true;
      }

      if (rsvpFilter === "not-attending") {
        matchesFilter = rsvp.attending === false;
      }

      return matchesSearch && matchesFilter;
    });
  }, [
    rsvps,
    rsvpSearch,
    rsvpFilter,
    invitations,
  ]);

  const attendingRsvps = rsvps.filter(
    (rsvp) => rsvp.attending === true
  );

  const notAttendingCount = rsvps.filter(
    (rsvp) => rsvp.attending === false
  ).length;

  const attendingInvitations = invitations.filter(
    (invitation) => {
      const rsvp = getLatestRsvp(
        invitation.invitation_id
      );

      return rsvp?.attending === true;
    }
  );

  const confirmedGuests = attendingInvitations.reduce(
    (total, invitation) =>
      total + Number(invitation.guest_count || 0),
    0
  );

  const totalInvitedGuests = invitations.reduce(
    (total, invitation) =>
      total + Number(invitation.guest_count || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#f8f1e7] px-4 py-8 text-[#4b2630]">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8 text-center">
          <div className="text-4xl">🌸</div>

          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#9b7440]">
            Wedding Management
          </p>

          <h1 className="mt-3 font-serif text-5xl text-[#6b1f32]">
            SHAILEY & DEEP
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            Invitation & RSVP Management
          </p>
        </header>

        {/* EDIT INVITATION */}
        {editingInvitation && (
          <section className="mb-8 rounded-3xl border-2 border-[#c9a45c] bg-white p-6 shadow-xl md:p-8">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#9b7440]">
                  Edit Existing Invitation
                </p>

                <h2 className="mt-2 font-serif text-3xl text-[#6b1f32]">
                  {editingInvitation.guest_name}
                </h2>

                <p className="mt-2 text-xs text-gray-500">
                  The personalized invitation link will stay the same.
                </p>
              </div>

              <button
                onClick={cancelEditing}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500"
              >
                Cancel
              </button>

            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">

              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                  Guest / Family Name
                </label>

                <input
                  value={editGuestName}
                  onChange={(e) =>
                    setEditGuestName(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                  Number of Guests
                </label>

                <input
                  type="number"
                  min="1"
                  value={editGuestCount}
                  onChange={(e) =>
                    setEditGuestCount(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
                />

                <p className="mt-1 text-xs text-gray-500">
                  This remains the fixed guest count.
                </p>
              </div>

            </div>

            {/* EDIT TYPE */}
            <div className="mt-7">

              <label className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                Invitation Type
              </label>

              <div className="mt-3 grid gap-3 md:grid-cols-3">

                <button
                  onClick={() =>
                    handleEditTypeChange("full")
                  }
                  className={`rounded-2xl border p-4 text-left ${
                    editInvitationType === "full"
                      ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="font-semibold">
                    Full Invitation
                  </div>

                  <div className="mt-1 text-xs opacity-80">
                    All wedding functions
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleEditTypeChange("custom")
                  }
                  className={`rounded-2xl border p-4 text-left ${
                    editInvitationType === "custom"
                      ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="font-semibold">
                    Custom Invitation
                  </div>

                  <div className="mt-1 text-xs opacity-80">
                    Select multiple functions
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleEditTypeChange("single")
                  }
                  className={`rounded-2xl border p-4 text-left ${
                    editInvitationType === "single"
                      ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="font-semibold">
                    Single Function
                  </div>

                  <div className="mt-1 text-xs opacity-80">
                    Select exactly one
                  </div>
                </button>

              </div>
            </div>

            {/* EDIT FUNCTIONS */}
            {editInvitationType !== "full" && (
              <div className="mt-7">

                <label className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                  Select Functions
                </label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">

                  {weddingFunctions.map((event) => {

                    const selected =
                      editSelectedFunctions.includes(
                        event.id
                      );

                    return (
                      <button
                        key={event.id}
                        onClick={() =>
                          toggleEditFunction(event.id)
                        }
                        className={`rounded-2xl border p-4 text-left ${
                          selected
                            ? "border-[#6b1f32] bg-[#fff5f5]"
                            : "border-gray-200 bg-white"
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                              selected
                                ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                                : "border-gray-300"
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </div>

                          <div>

                            <div className="font-serif text-lg text-[#6b1f32]">
                              {event.name}
                            </div>

                            <div className="text-xs text-gray-500">
                              {event.date} • {event.time}
                            </div>

                          </div>

                        </div>

                      </button>
                    );
                  })}

                </div>
              </div>
            )}

            {editInvitationType === "full" && (
              <div className="mt-6 rounded-2xl bg-[#f8f1e7] p-4 text-sm text-[#6b1f32]">
                ✓ All {weddingFunctions.length} wedding
                functions will be included.
              </div>
            )}

            <button
              onClick={saveInvitationEdit}
              disabled={savingEdit}
              className="mt-7 w-full rounded-full bg-[#6b1f32] px-6 py-4 text-sm font-medium text-white shadow-lg disabled:opacity-60"
            >
              {savingEdit
                ? "Saving Changes..."
                : "Save Invitation Changes"}
            </button>

            {editMessage && (
              <p className="mt-4 text-center text-sm text-[#6b1f32]">
                {editMessage}
              </p>
            )}

          </section>
        )}

        {/* DASHBOARD SUMMARY */}
        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">

          <div className="rounded-2xl border border-[#c9a45c]/40 bg-white p-5 text-center shadow-sm">
            <div className="text-3xl font-semibold text-[#6b1f32]">
              {invitations.length}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Invitations
            </div>
          </div>

          <div className="rounded-2xl border border-[#c9a45c]/40 bg-white p-5 text-center shadow-sm">
            <div className="text-3xl font-semibold text-[#6b1f32]">
              {totalInvitedGuests}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Total Invited
            </div>
          </div>

          <div className="rounded-2xl border border-[#c9a45c]/40 bg-white p-5 text-center shadow-sm">
            <div className="text-3xl font-semibold text-[#6b1f32]">
              {rsvps.length}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              RSVPs
            </div>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-5 text-center shadow-sm">
            <div className="text-3xl font-semibold text-green-700">
              {confirmedGuests}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Confirmed Guests
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-5 text-center shadow-sm">
            <div className="text-3xl font-semibold text-red-700">
              {notAttendingCount}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Not Attending
            </div>
          </div>

        </section>

        {/* CREATE INVITATION */}
        <section className="rounded-3xl border border-[#c9a45c]/40 bg-white p-6 shadow-lg md:p-8">

          <div className="mb-6">

            <p className="text-xs uppercase tracking-[0.25em] text-[#9b7440]">
              Host Panel
            </p>

            <h2 className="mt-2 font-serif text-3xl text-[#6b1f32]">
              Create Invitation
            </h2>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                Guest / Family Name
              </label>

              <input
                value={guestName}
                onChange={(e) =>
                  setGuestName(e.target.value)
                }
                placeholder="Example: Patel Family"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                Number of Guests
              </label>

              <input
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) =>
                  setGuestCount(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
              />

              <p className="mt-1 text-xs text-gray-500">
                This number is fixed for the guest.
              </p>
            </div>

          </div>

          {/* INVITATION TYPE */}
          <div className="mt-7">

            <label className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
              Invitation Type
            </label>

            <div className="mt-3 grid gap-3 md:grid-cols-3">

              <button
                onClick={() =>
                  handleInvitationTypeChange("full")
                }
                className={`rounded-2xl border p-4 text-left ${
                  invitationType === "full"
                    ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="font-semibold">
                  Full Invitation
                </div>

                <div className="mt-1 text-xs opacity-80">
                  All wedding functions
                </div>
              </button>

              <button
                onClick={() =>
                  handleInvitationTypeChange("custom")
                }
                className={`rounded-2xl border p-4 text-left ${
                  invitationType === "custom"
                    ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="font-semibold">
                  Custom Invitation
                </div>

                <div className="mt-1 text-xs opacity-80">
                  Select multiple functions
                </div>
              </button>

              <button
                onClick={() =>
                  handleInvitationTypeChange("single")
                }
                className={`rounded-2xl border p-4 text-left ${
                  invitationType === "single"
                    ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="font-semibold">
                  Single Function
                </div>

                <div className="mt-1 text-xs opacity-80">
                  Select exactly one
                </div>
              </button>

            </div>
          </div>

          {/* FUNCTIONS */}
          {invitationType !== "full" && (
            <div className="mt-7">

              <label className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                Select Functions
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">

                {weddingFunctions.map((event) => {

                  const selected =
                    selectedFunctions.includes(event.id);

                  return (
                    <button
                      key={event.id}
                      onClick={() =>
                        toggleFunction(event.id)
                      }
                      className={`rounded-2xl border p-4 text-left ${
                        selected
                          ? "border-[#6b1f32] bg-[#fff5f5]"
                          : "border-gray-200 bg-white"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                            selected
                              ? "border-[#6b1f32] bg-[#6b1f32] text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {selected ? "✓" : ""}
                        </div>

                        <div>

                          <div className="font-serif text-lg text-[#6b1f32]">
                            {event.name}
                          </div>

                          <div className="text-xs text-gray-500">
                            {event.date} • {event.time}
                          </div>

                        </div>

                      </div>

                    </button>
                  );
                })}

              </div>
            </div>
          )}

          {invitationType === "full" && (
            <div className="mt-6 rounded-2xl bg-[#f8f1e7] p-4 text-sm text-[#6b1f32]">
              ✓ All {weddingFunctions.length} wedding
              functions will be included.
            </div>
          )}

          <button
            onClick={createInvitation}
            disabled={creating}
            className="mt-7 w-full rounded-full bg-[#6b1f32] px-6 py-4 text-sm font-medium text-white shadow-lg disabled:opacity-60"
          >
            {creating
              ? "Creating Invitation..."
              : "Create Invitation"}
          </button>

          {message && (
            <p className="mt-4 text-center text-sm text-[#6b1f32]">
              {message}
            </p>
          )}

          {createdLink && (
            <div className="mt-6 rounded-2xl border border-[#c9a45c]/50 bg-[#fffaf3] p-5">

              <p className="text-xs uppercase tracking-[0.2em] text-[#9b7440]">
                Invitation Ready
              </p>

              <p className="mt-3 break-all rounded-xl bg-white p-3 text-sm text-gray-600">
                {createdLink}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <button
                  onClick={() =>
                    copyLink(createdLink)
                  }
                  className="rounded-full border border-[#c9a45c] px-4 py-3 text-sm text-[#8a6636]"
                >
                  Copy Link
                </button>

                <button
                  onClick={() =>
                    shareWhatsApp(
                      createdLink,
                      guestName
                    )
                  }
                  className="rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white"
                >
                  WhatsApp
                </button>

                <a
                  href={createdLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#6b1f32] px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Open Invitation
                </a>

              </div>
            </div>
          )}

        </section>

        {/* GUEST MANAGEMENT */}
        <section className="mt-8 rounded-3xl border border-[#c9a45c]/40 bg-white p-6 shadow-lg md:p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#9b7440]">
                Guest List
              </p>

              <h2 className="mt-2 font-serif text-3xl text-[#6b1f32]">
                Guest & Family Management
              </h2>

            </div>

            <button
              onClick={loadAdminData}
              className="rounded-full border border-[#c9a45c] px-5 py-2 text-sm text-[#8a6636]"
            >
              Refresh
            </button>

          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">

            <input
              value={invitationSearch}
              onChange={(e) =>
                setInvitationSearch(e.target.value)
              }
              placeholder="Search guest or family..."
              className="w-full rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
            />

            <select
              value={invitationFilter}
              onChange={(e) =>
                setInvitationFilter(e.target.value)
              }
              className="rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
            >
              <option value="all">All Guests</option>
              <option value="attending">Attending</option>
              <option value="not-attending">
                Not Attending
              </option>
              <option value="no-response">
                No RSVP Yet
              </option>
            </select>

          </div>

          {loadingData ? (
            <p className="mt-6 text-sm text-gray-500">
              Loading guests...
            </p>
          ) : filteredInvitations.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-[#f8f1e7] p-6 text-center">
              <p className="font-serif text-xl text-[#6b1f32]">
                No matching guests
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">

              {filteredInvitations.map((invitation) => {

                const invitationRsvp =
                  getLatestRsvp(
                    invitation.invitation_id
                  );

                const invitationLink =
                  `${window.location.origin}/invite/${invitation.invitation_id}`;

                return (
                  <div
                    key={invitation.invitation_id}
                    className="rounded-2xl border border-gray-200 bg-[#fffdfa] p-5"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0">

                        <h3 className="font-serif text-2xl text-[#6b1f32]">
                          {invitation.guest_name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">

                          <span className="rounded-full bg-[#f8f1e7] px-3 py-1 text-xs text-[#8a6636]">
                            👥 {invitation.guest_count}{" "}
                            {Number(invitation.guest_count) === 1
                              ? "Guest"
                              : "Guests"}
                          </span>

                          <span className="rounded-full bg-[#f8f1e7] px-3 py-1 text-xs capitalize text-[#8a6636]">
                            💌 {invitation.invitation_type}
                          </span>

                          {invitationRsvp ? (
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                invitationRsvp.attending
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {invitationRsvp.attending
                                ? "✓ Attending"
                                : "✕ Not Attending"}
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                              No RSVP
                            </span>
                          )}

                        </div>

                        <div className="mt-4">

                          <p className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                            Functions
                          </p>

                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {getFunctionNames(
                              invitation.selected_functions
                            )}
                          </p>

                        </div>

                        {invitationRsvp?.message && (
                          <div className="mt-4 rounded-xl bg-[#f8f1e7] p-4">

                            <p className="text-xs uppercase tracking-[0.15em] text-[#9b7440]">
                              RSVP Message
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                              {invitationRsvp.message}
                            </p>

                          </div>
                        )}

                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">

                        <button
                          onClick={() =>
                            startEditing(invitation)
                          }
                          className="rounded-full border border-[#6b1f32] px-4 py-2 text-xs font-medium text-[#6b1f32]"
                        >
                          ✏ Edit
                        </button>

                        <button
                          onClick={() =>
                            copyLink(invitationLink)
                          }
                          className="rounded-full border border-[#c9a45c] px-4 py-2 text-xs text-[#8a6636]"
                        >
                          🔗 Copy Link
                        </button>

                        <button
                          onClick={() =>
                            shareWhatsApp(
                              invitationLink,
                              invitation.guest_name
                            )
                          }
                          className="rounded-full bg-[#25D366] px-4 py-2 text-xs text-white"
                        >
                          WhatsApp
                        </button>

                        <a
                          href={`/invite/${invitation.invitation_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#6b1f32] px-4 py-2 text-xs text-white"
                        >
                          👁 Open
                        </a>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* RSVP MANAGEMENT */}
        <section className="mt-8 rounded-3xl border border-[#c9a45c]/40 bg-white p-6 shadow-lg md:p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#9b7440]">
                Guest Responses
              </p>

              <h2 className="mt-2 font-serif text-3xl text-[#6b1f32]">
                RSVP Management
              </h2>

            </div>

            <button
              onClick={loadAdminData}
              className="rounded-full border border-[#c9a45c] px-5 py-2 text-sm text-[#8a6636]"
            >
              Refresh RSVPs
            </button>

          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">

            <div className="rounded-2xl bg-[#f8f1e7] p-4 text-center">
              <div className="text-2xl font-semibold text-[#6b1f32]">
                {rsvps.length}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Total RSVPs
              </div>
            </div>

            <div className="rounded-2xl bg-green-50 p-4 text-center">
              <div className="text-2xl font-semibold text-green-700">
                {attendingRsvps.length}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Attending
              </div>
            </div>

            <div className="rounded-2xl bg-red-50 p-4 text-center">
              <div className="text-2xl font-semibold text-red-700">
                {notAttendingCount}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Not Attending
              </div>
            </div>

          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">

            <input
              value={rsvpSearch}
              onChange={(e) =>
                setRsvpSearch(e.target.value)
              }
              placeholder="Search RSVP by guest or family..."
              className="w-full rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
            />

            <select
              value={rsvpFilter}
              onChange={(e) =>
                setRsvpFilter(e.target.value)
              }
              className="rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#c9a45c]"
            >
              <option value="all">All RSVPs</option>
              <option value="attending">Attending</option>
              <option value="not-attending">
                Not Attending
              </option>
            </select>

          </div>

          {loadingData ? (
            <p className="mt-6 text-sm text-gray-500">
              Loading RSVPs...
            </p>
          ) : filteredRsvps.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-[#f8f1e7] p-6 text-center">
              <p className="font-serif text-xl text-[#6b1f32]">
                No matching RSVPs
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">

              {filteredRsvps.map((rsvp) => (

                <div
                  key={rsvp.id}
                  className="rounded-2xl border border-gray-200 bg-[#fffdfa] p-5"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <h3 className="font-serif text-xl text-[#6b1f32]">
                        {rsvp.guest_name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Family / Invitation:{" "}
                        {getInvitationName(
                          rsvp.invitation_id
                        )}
                      </p>

                    </div>

                    <div
                      className={`rounded-full px-4 py-2 text-xs font-medium ${
                        rsvp.attending
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {rsvp.attending
                        ? "✓ Attending"
                        : "✕ Not Attending"}
                    </div>

                  </div>

                  {rsvp.message && (
                    <div className="mt-4 rounded-xl bg-[#f8f1e7] p-4">

                      <p className="text-xs uppercase tracking-wider text-[#9b7440]">
                        Message
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {rsvp.message}
                      </p>

                    </div>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(
                      rsvp.created_at
                    ).toLocaleString()}
                  </p>

                </div>

              ))}

            </div>
          )}

        </section>

        <footer className="py-10 text-center">

          <p className="font-serif text-xl text-[#6b1f32]">
            SHAILEY & DEEP
          </p>

          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#9b7440]">
            With love and blessings
          </p>

        </footer>

      </div>
    </main>
  );
}