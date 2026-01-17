"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { ContactForm } from "./contact-form";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  relationship: string | null;
  priority: number;
  notifyByEmail: boolean;
  notifyBySms: boolean;
};

export function ContactList() {
  const [contacts] = api.contact.list.useSuspenseQuery();
  const utils = api.useUtils();

  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const deleteContact = api.contact.delete.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate();
      setDeleteConfirmId(null);
    },
  });

  const handleDelete = (id: string) => {
    deleteContact.mutate({ id });
  };

  const handleFormClose = () => {
    setEditingContact(null);
    setIsAddingContact(false);
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Add Contact Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsAddingContact(true)}
          className="rounded-full bg-white/20 px-6 py-2 font-semibold transition hover:bg-white/30"
        >
          Add Contact
        </button>
      </div>

      {/* Contact Form Modal */}
      {(isAddingContact || editingContact) && (
        <div className="mb-6">
          <ContactForm
            contact={editingContact ?? undefined}
            onClose={handleFormClose}
          />
        </div>
      )}

      {/* Empty State */}
      {contacts.length === 0 && !isAddingContact && (
        <div className="rounded-xl bg-white/10 p-8 text-center">
          <p className="text-white/70">
            No contacts yet. Add your first trusted contact.
          </p>
        </div>
      )}

      {/* Contact List */}
      {contacts.length > 0 && (
        <div className="flex flex-col gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-xl bg-white/10 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{contact.name}</h3>
                    {contact.relationship && (
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs capitalize">
                        {contact.relationship}
                      </span>
                    )}
                    <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs">
                      Priority: {contact.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/70">{contact.email}</p>
                  {contact.phone && (
                    <p className="text-sm text-white/70">{contact.phone}</p>
                  )}
                  <div className="mt-2 flex gap-4 text-xs text-white/50">
                    <span>
                      Email: {contact.notifyByEmail ? "Yes" : "No"}
                    </span>
                    <span>
                      SMS: {contact.notifyBySms ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingContact(contact)}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
                  >
                    Edit
                  </button>
                  {deleteConfirmId === contact.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(contact.id)}
                        disabled={deleteContact.isPending}
                        className="rounded-lg bg-red-500/30 px-4 py-2 text-sm transition hover:bg-red-500/50 disabled:opacity-50"
                      >
                        {deleteContact.isPending ? "..." : "Confirm"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(contact.id)}
                      className="rounded-lg bg-red-500/20 px-4 py-2 text-sm transition hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
