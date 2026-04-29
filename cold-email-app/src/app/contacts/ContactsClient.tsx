"use client";

import { useState } from "react";

type Contact = {
  id: string;
  owner_id: string;
  email: string;
  name: string | null;
  company: string | null;
  job_title: string | null;
  status: "not_sent" | "sent";
  created_at: string;
};

type Filter = "all" | "not_sent" | "sent";

export default function ContactsClient({
  initialContacts,
}: {
  initialContacts: Contact[];
}) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [filter, setFilter] = useState<Filter>("all");
  const [editMode, setEditMode] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    email: "",
    name: "",
    company: "",
    job_title: "",
  });

  const filteredContacts = contacts.filter((contact) => {
    if (filter === "all") return true;
    return contact.status === filter;
  });

  const allCount = contacts.length;
  const notSentCount = contacts.filter((c) => c.status === "not_sent").length;
  const sentCount = contacts.filter((c) => c.status === "sent").length;

  async function addContact(formData: FormData) {
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: String(formData.get("email") || "").trim(),
        name: String(formData.get("name") || "").trim(),
        company: String(formData.get("company") || "").trim(),
        job_title: String(formData.get("job_title") || "").trim(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to add contact.");
      return;
    }

    setContacts((current) => [result.contact, ...current]);
  }

  async function updateContact() {
    if (!selectedContact) {
      alert("No contact selected.");
      return;
    }

    const response = await fetch(`/api/contacts/${selectedContact.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: editForm.email.trim(),
        name: editForm.name.trim(),
        company: editForm.company.trim(),
        job_title: editForm.job_title.trim(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to update contact.");
      return;
    }

    setContacts((current) =>
      current.map((contact) =>
        contact.id === selectedContact.id ? result.contact : contact
      )
    );

    setShowEditModal(false);
    setSelectedContact(null);
  }

  async function deleteContact() {
    if (!selectedContact) {
      alert("No contact selected.");
      return;
    }

    const response = await fetch(`/api/contacts/${selectedContact.id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to delete contact.");
      return;
    }

    setContacts((current) =>
      current.filter((contact) => contact.id !== selectedContact.id)
    );

    setShowEditModal(false);
    setSelectedContact(null);
  }

  function startEditMode() {
    setEditMode(true);
    setSelectedContact(null);
    setShowEditModal(false);
  }

  function doneEditing() {
    setEditMode(false);
    setSelectedContact(null);
    setShowEditModal(false);
  }

  function openEditModal(contact: Contact) {
    setSelectedContact(contact);
    setEditForm({
      email: contact.email,
      name: contact.name ?? "",
      company: contact.company ?? "",
      job_title: contact.job_title ?? "",
    });
    setShowEditModal(true);
  }

  return (
    <>
      <section className="mb-8 border border-black p-7">
        <h2 className="mb-5 text-xl font-bold">Add Contact</h2>

        <form action={addContact} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="border border-black px-3 py-2 text-base outline-none"
            />

            <input
              name="name"
              placeholder="Name"
              className="border border-black px-3 py-2 text-base outline-none"
            />

            <input
              name="company"
              placeholder="Company"
              className="border border-black px-3 py-2 text-base outline-none"
            />

            <input
              name="job_title"
              placeholder="Job Title"
              className="border border-black px-3 py-2 text-base outline-none"
            />
          </div>

          <button className="w-full border border-black py-2 text-base hover:bg-black hover:text-white">
            Add Contact
          </button>
        </form>
      </section>

      <section className="border border-black p-7">
        <h2 className="mb-5 text-xl font-bold">Saved Contacts</h2>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2 text-base">
            <button
              onClick={() => setFilter("all")}
              className={
                filter === "all"
                  ? "border border-black bg-black px-4 py-2 text-white"
                  : "border border-black px-4 py-2 hover:bg-black hover:text-white"
              }
            >
              All ({allCount})
            </button>

            <button
              onClick={() => setFilter("not_sent")}
              className={
                filter === "not_sent"
                  ? "border border-black bg-black px-4 py-2 text-white"
                  : "border border-black px-4 py-2 hover:bg-black hover:text-white"
              }
            >
              Not Sent ({notSentCount})
            </button>

            <button
              onClick={() => setFilter("sent")}
              className={
                filter === "sent"
                  ? "border border-black bg-black px-4 py-2 text-white"
                  : "border border-black px-4 py-2 hover:bg-black hover:text-white"
              }
            >
              Sent ({sentCount})
            </button>
          </div>

          {!editMode ? (
            <button
              onClick={startEditMode}
              className="border border-black px-20 py-2 hover:bg-black hover:text-white"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={doneEditing}
              className="border border-black px-10 py-2 hover:bg-black hover:text-white"
            >
              Done Editing
            </button>
          )}
        </div>

        {filteredContacts.length === 0 ? (
          <p className="text-base">No contacts in this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-base">
              <thead>
                <tr>
                  {editMode && (
                    <th className="border border-black px-4 py-3">Select</th>
                  )}
                  <th className="border border-black px-4 py-3">Email</th>
                  <th className="border border-black px-4 py-3">Name</th>
                  <th className="border border-black px-4 py-3">Company</th>
                  <th className="border border-black px-4 py-3">Job Title</th>
                  <th className="border border-black px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={
                      selectedContact?.id === contact.id ? "bg-gray-100" : ""
                    }
                  >
                    {editMode && (
                      <td className="border border-black px-4 py-3">
                        <input
                          type="radio"
                          name="selected_contact"
                          checked={selectedContact?.id === contact.id}
                          onChange={() => openEditModal(contact)}
                        />
                      </td>
                    )}

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

                    <td className="border border-black px-4 py-3">
                      {contact.status === "sent" ? "Sent" : "Not Sent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showEditModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl border border-black bg-white p-7">
            <h2 className="mb-5 text-xl font-bold">Edit Contact</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Email"
                  className="border border-black px-3 py-2 text-base outline-none"
                />

                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Name"
                  className="border border-black px-3 py-2 text-base outline-none"
                />

                <input
                  value={editForm.company}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Company"
                  className="border border-black px-3 py-2 text-base outline-none"
                />

                <input
                  value={editForm.job_title}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      job_title: e.target.value,
                    }))
                  }
                  placeholder="Job Title"
                  className="border border-black px-3 py-2 text-base outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={updateContact}
                  className="border border-black py-2 hover:bg-black hover:text-white"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={deleteContact}
                  className="border border-black py-2 hover:bg-black hover:text-white"
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedContact(null);
                  }}
                  className="border border-black py-2 hover:bg-black hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}