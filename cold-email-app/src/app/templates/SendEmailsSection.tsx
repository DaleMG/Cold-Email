"use client";

import { useState } from "react";

type Contact = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  job_title: string | null;
  status: string;
};

export default function SendEmailsSection({
  contacts,
}: {
  contacts: Contact[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const toggleContact = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((contactId) => contactId !== id)
        : [...current, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(contacts.map((contact) => contact.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const sendEmails = async () => {
    setMessage("");

    if (selectedIds.length === 0) {
      setMessage("Select at least one contact.");
      return;
    }

    setSending(true);

    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactIds: selectedIds }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Something went wrong.");
      setSending(false);
      return;
    }

    setMessage(`Sent ${result.sentCount} email(s).`);
    setSelectedIds([]);
    setSending(false);

    window.location.reload();
  };

  return (
    <section className="mt-8 border border-black p-7">
      <h2 className="mb-5 text-xl font-bold">Send Emails</h2>

      <div className="mb-4 text-base">
        Available to send: {contacts.length} | Selected: {selectedIds.length}
      </div>

      {message && (
        <div className="mb-4 border border-black px-4 py-3 text-base">
          {message}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="border border-black px-4 py-2 hover:bg-black hover:text-white"
        >
          Select All Sendable
        </button>

        <button
          type="button"
          onClick={clearSelection}
          className="border border-black px-4 py-2 hover:bg-black hover:text-white"
        >
          Clear Selection
        </button>

        <button
          type="button"
          onClick={sendEmails}
          disabled={sending}
          className="border border-black px-4 py-2 hover:bg-black hover:text-white disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Emails"}
        </button>
      </div>

      {contacts.length === 0 ? (
        <p>No not-sent contacts available.</p>
      ) : (
        <table className="w-full border-collapse text-left text-base">
          <thead>
            <tr>
              <th className="border border-black px-4 py-3">Select</th>
              <th className="border border-black px-4 py-3">Email</th>
              <th className="border border-black px-4 py-3">Name</th>
              <th className="border border-black px-4 py-3">Company</th>
              <th className="border border-black px-4 py-3">Job Title</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="border border-black px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                  />
                </td>
                <td className="border border-black px-4 py-3">
                  {contact.email}
                </td>
                <td className="border border-black px-4 py-3">
                  {contact.name || "-"}
                </td>
                <td className="border border-black px-4 py-3">
                  {contact.company || "-"}
                </td>
                <td className="border border-black px-4 py-3">
                  {contact.job_title || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}