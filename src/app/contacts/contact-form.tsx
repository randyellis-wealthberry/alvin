"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

const RELATIONSHIP_OPTIONS = [
  "spouse",
  "child",
  "sibling",
  "parent",
  "friend",
  "other",
] as const;

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

type ContactFormProps = {
  contact?: Contact;
  onClose: () => void;
};

export function ContactForm({ contact, onClose }: ContactFormProps) {
  const utils = api.useUtils();
  const isEditing = !!contact;

  const [name, setName] = useState(contact?.name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [relationship, setRelationship] = useState(contact?.relationship ?? "");
  const [priority, setPriority] = useState(contact?.priority ?? 999);
  const [notifyByEmail, setNotifyByEmail] = useState(
    contact?.notifyByEmail ?? true,
  );
  const [notifyBySms, setNotifyBySms] = useState(contact?.notifyBySms ?? false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createContact = api.contact.create.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate();
      setSuccessMessage("Contact added successfully!");
      setErrorMessage(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to add contact");
      setSuccessMessage(null);
    },
  });

  const updateContact = api.contact.update.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate();
      setSuccessMessage("Contact updated successfully!");
      setErrorMessage(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to update contact");
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (isEditing) {
      updateContact.mutate({
        id: contact.id,
        name,
        email,
        phone: phone || null,
        relationship: relationship || null,
        priority,
        notifyByEmail,
        notifyBySms,
      });
    } else {
      createContact.mutate({
        name,
        email,
        phone: phone || undefined,
        relationship: relationship || undefined,
        priority,
        notifyByEmail,
        notifyBySms,
      });
    }
  };

  const isPending = createContact.isPending || updateContact.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6 rounded-xl bg-white/10 p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit Contact" : "Add New Contact"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-white/50 transition hover:text-white"
        >
          Cancel
        </button>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-lg bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
          placeholder="John Doe"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
          placeholder="john@example.com"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone (optional)
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {/* Relationship */}
      <div className="flex flex-col gap-2">
        <label htmlFor="relationship" className="text-sm font-medium">
          Relationship (optional)
        </label>
        <select
          id="relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="rounded-lg bg-white/10 px-4 py-2 text-white"
        >
          <option value="" className="bg-[#15162c]">
            Select relationship
          </option>
          {RELATIONSHIP_OPTIONS.map((rel) => (
            <option key={rel} value={rel} className="bg-[#15162c] capitalize">
              {rel.charAt(0).toUpperCase() + rel.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <input
          id="priority"
          type="number"
          min={1}
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="rounded-lg bg-white/10 px-4 py-2 text-white"
        />
        <p className="text-xs text-white/50">
          Lower number = notified first (1 is highest priority)
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Notification Preferences</p>
        <div className="flex items-center gap-3">
          <input
            id="notifyByEmail"
            type="checkbox"
            checked={notifyByEmail}
            onChange={(e) => setNotifyByEmail(e.target.checked)}
            className="h-5 w-5 rounded bg-white/10"
          />
          <label htmlFor="notifyByEmail" className="text-sm">
            Notify by email
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="notifyBySms"
            type="checkbox"
            checked={notifyBySms}
            onChange={(e) => setNotifyBySms(e.target.checked)}
            disabled
            className="h-5 w-5 rounded bg-white/10 opacity-50"
          />
          <label htmlFor="notifyBySms" className="text-sm text-white/50">
            Notify by SMS (coming soon)
          </label>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <p className="rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-300">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-white/20 px-6 py-3 font-semibold transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : isEditing
            ? "Update Contact"
            : "Add Contact"}
      </button>
    </form>
  );
}
