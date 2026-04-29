"use client";

import { useState } from "react";

type Template = {
  id: string;
  owner_id: string;
  subject: string | null;
  body: string | null;
};

export default function TemplateManager({
  template,
}: {
  template: Template | null;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [savedSubject, setSavedSubject] = useState(template?.subject ?? "");
  const [savedBody, setSavedBody] = useState(template?.body ?? "");
  const [message, setMessage] = useState("");

  async function saveTemplate() {
    setMessage("");

    const response = await fetch("/api/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, body }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to save template.");
      return;
    }

    setSavedSubject(result.template.subject ?? "");
    setSavedBody(result.template.body ?? "");
    setShowEditModal(false);
    setMessage("Template saved.");
  }

  function openEditModal() {
    setSubject(savedSubject);
    setBody(savedBody);
    setMessage("");
    setShowEditModal(true);
  }

  function cancelEdit() {
    setSubject(savedSubject);
    setBody(savedBody);
    setShowEditModal(false);
  }

  return (
    <>
      <section className="border border-black p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Template Manager</h2>

          <button
            type="button"
            onClick={openEditModal}
            className="border border-black px-6 py-2 hover:bg-black hover:text-white"
          >
            Edit
          </button>
        </div>

        <div className="mb-4 border border-black px-3 py-2 text-sm">
          Available placeholders: {"{name}"}, {"{job_title}"}, {"{company}"},{" "}
          {"{email}"}
        </div>

        {message && (
          <div className="mb-4 border border-black px-4 py-3 text-base">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Subject</label>
            <div className="min-h-[42px] w-full border border-black px-3 py-2 text-base">
              {savedSubject || "No subject saved."}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Body</label>
            <div className="min-h-[200px] w-full whitespace-pre-wrap border border-black px-3 py-2 text-base">
              {savedBody || "No body saved."}
            </div>
          </div>
        </div>
      </section>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl border border-black bg-white p-7">
            <h2 className="mb-5 text-xl font-bold">Edit Template</h2>

            <div className="mb-4 border border-black px-3 py-2 text-sm">
              Available placeholders: {"{name}"}, {"{job_title}"},{" "}
              {"{company}"}, {"{email}"}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full border border-black px-3 py-2 text-base outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email here. You can use placeholders like {name}, {company}, etc."
                  rows={10}
                  className="w-full border border-black px-3 py-2 text-base outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={saveTemplate}
                  className="border border-black py-2 hover:bg-black hover:text-white"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={cancelEdit}
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