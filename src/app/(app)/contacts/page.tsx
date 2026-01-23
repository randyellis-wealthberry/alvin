"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Mail,
  Phone,
  Pencil,
  Trash2,
  X,
  Shield,
  Bell,
  UserPlus,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "parent", label: "Parent" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

const PRIORITY_INFO = [
  { level: 1, label: "First", desc: "Notified immediately", color: "violet" },
  { level: 2, label: "Second", desc: "After 1 hour", color: "blue" },
  { level: 3, label: "Third", desc: "After 2 hours", color: "cyan" },
  { level: 4, label: "Fourth", desc: "After 4 hours", color: "slate" },
];

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard Component
// ─────────────────────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "emerald" | "violet" | "amber" | "rose" | "blue" | "cyan";
}) {
  const glowColors = {
    emerald: "shadow-emerald-500/20",
    violet: "shadow-violet-500/20",
    amber: "shadow-amber-500/20",
    rose: "shadow-rose-500/20",
    blue: "shadow-blue-500/20",
    cyan: "shadow-cyan-500/20",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        glow && `shadow-2xl ${glowColors[glow]}`,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Priority Badge
// ─────────────────────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: number }) {
  const colors = {
    1: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    2: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    3: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    4: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-xs font-medium",
        colors[priority as keyof typeof colors] || colors[4],
      )}
    >
      Priority {priority}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact Form Modal
// ─────────────────────────────────────────────────────────────────────────────

function ContactFormModal({
  contact,
  onClose,
}: {
  contact?: Contact;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const isEditing = !!contact;

  const [name, setName] = useState(contact?.name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [relationship, setRelationship] = useState(contact?.relationship ?? "");
  const [priority, setPriority] = useState(contact?.priority ?? 1);
  const [notifyByEmail, setNotifyByEmail] = useState(
    contact?.notifyByEmail ?? true,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const createContact = api.contact.create.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate();
      setShowSuccess(true);
      setTimeout(onClose, 1000);
    },
  });

  const updateContact = api.contact.update.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate();
      setShowSuccess(true);
      setTimeout(onClose, 1000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      email,
      phone: phone || undefined,
      relationship: relationship || undefined,
      priority,
      notifyByEmail,
      notifyBySms: false,
    };

    if (isEditing) {
      updateContact.mutate({ id: contact.id, ...data });
    } else {
      createContact.mutate(data);
    }
  };

  const isPending = createContact.isPending || updateContact.isPending;
  const error = createContact.error ?? updateContact.error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="animate-reveal relative w-full max-w-md">
        <GlassCard className="p-6" glow="violet">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? "Edit Contact" : "Add Contact"}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm text-white/60">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Phone <span className="text-white/30">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-violet-500/50 focus:outline-none"
              >
                <option value="" className="bg-[#1a1a2e]">
                  Select relationship
                </option>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-[#1a1a2e]"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-3 block text-sm text-white/60">
                Alert Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITY_INFO.map((p) => (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriority(p.level)}
                    className={cn(
                      "rounded-xl py-3 text-sm font-medium transition-all",
                      priority === p.level
                        ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                        : "bg-white/5 text-white/60 hover:bg-white/10",
                    )}
                  >
                    {p.level}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/40">
                {PRIORITY_INFO.find((p) => p.level === priority)?.desc}
              </p>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/60" />
                <span className="text-sm text-white">Email notifications</span>
              </div>
              <button
                type="button"
                onClick={() => setNotifyByEmail(!notifyByEmail)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  notifyByEmail ? "bg-violet-500" : "bg-white/20",
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                    notifyByEmail ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-rose-500/20 px-4 py-3 text-sm text-rose-300">
                {error.message}
              </div>
            )}

            {/* Success */}
            {showSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
                <Check className="h-4 w-4" />
                {isEditing ? "Contact updated!" : "Contact added!"}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white/70 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || showSuccess}
                className={cn(
                  "flex-1 rounded-xl py-3 font-medium transition-all",
                  "bg-gradient-to-r from-violet-500 to-violet-600",
                  "text-white shadow-lg shadow-violet-500/30",
                  "hover:shadow-violet-500/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {isPending ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : isEditing ? (
                  "Update Contact"
                ) : (
                  "Add Contact"
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirmation Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirmModal({
  contact,
  onClose,
  onConfirm,
  isPending,
}: {
  contact: Contact;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-reveal relative w-full max-w-sm">
        <GlassCard className="p-6" glow="rose">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          </div>
          <h3 className="mb-2 text-center text-lg font-semibold text-white">
            Delete Contact
          </h3>
          <p className="mb-6 text-center text-sm text-white/60">
            Are you sure you want to remove{" "}
            <strong className="text-white">{contact.name}</strong> from your
            contacts?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white/70 transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 rounded-xl bg-rose-500 py-3 font-medium text-white transition-colors hover:bg-rose-400 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact Card
// ─────────────────────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  onEdit,
  onDelete,
  index,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  const priorityColors = {
    1: "from-violet-500/20 to-violet-500/5",
    2: "from-blue-500/20 to-blue-500/5",
    3: "from-cyan-500/20 to-cyan-500/5",
    4: "from-slate-500/20 to-slate-500/5",
  };

  return (
    <div
      className="animate-reveal"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <GlassCard className="group p-5 transition-colors hover:border-white/10">
        {/* Priority Gradient Overlay */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50",
            priorityColors[contact.priority as keyof typeof priorityColors] ||
              priorityColors[4],
          )}
        />

        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-500/10">
                <span className="text-lg font-bold text-violet-300">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{contact.name}</h3>
                {contact.relationship && (
                  <span className="text-xs text-white/50 capitalize">
                    {contact.relationship}
                  </span>
                )}
              </div>
            </div>
            <PriorityBadge priority={contact.priority} />
          </div>

          {/* Contact Info */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-white/40" />
              <span className="truncate text-white/70">{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-white/40" />
                <span className="text-white/70">{contact.phone}</span>
              </div>
            )}
          </div>

          {/* Notification Status */}
          <div className="mb-4 flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Bell
                className={cn(
                  "h-3 w-3",
                  contact.notifyByEmail && "text-emerald-400",
                )}
              />
              Email {contact.notifyByEmail ? "On" : "Off"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Contacts Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const utils = api.useUtils();
  const { data: contacts, isLoading } = api.contact.list.useQuery();

  const deleteContact = api.contact.delete.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate();
      setDeletingContact(null);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute bottom-20 left-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 px-4 pt-8 pb-32">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div
            className={cn(
              "mb-8 transition-all duration-700",
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-xs font-medium tracking-[0.2em] text-violet-400/80 uppercase">
                  Emergency Network
                </p>
                <h1 className="text-3xl font-bold text-white">
                  Trusted Contacts
                </h1>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-white/50">
              These people will be notified if you miss a check-in
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <GlassCard className="p-12">
              <div className="flex flex-col items-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-violet-400" />
                <p className="text-white/60">Loading contacts...</p>
              </div>
            </GlassCard>
          )}

          {/* Empty State */}
          {!isLoading && (!contacts || contacts.length === 0) && (
            <div
              className={cn(
                "transition-all delay-100 duration-700",
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              <GlassCard className="p-10 text-center" glow="violet">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/20">
                  <UserPlus className="h-10 w-10 text-violet-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  No contacts yet
                </h3>
                <p className="mx-auto mb-6 max-w-sm text-white/60">
                  Add trusted contacts who will be notified if you miss a
                  wellness check-in
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-6 py-3",
                    "bg-gradient-to-r from-violet-500 to-violet-600",
                    "font-medium text-white",
                    "shadow-lg shadow-violet-500/30",
                    "hover:shadow-violet-500/50",
                    "transition-all duration-300",
                  )}
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Contact
                </button>
              </GlassCard>
            </div>
          )}

          {/* Contact List */}
          {!isLoading && contacts && contacts.length > 0 && (
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  index={index}
                  onEdit={() => setEditingContact(contact)}
                  onDelete={() => setDeletingContact(contact)}
                />
              ))}
            </div>
          )}

          {/* Info Section */}
          {!isLoading && contacts && contacts.length > 0 && (
            <div
              className={cn(
                "mt-8 transition-all duration-700",
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              <GlassCard className="p-5" glow="blue">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">How Alerts Work</h3>
                </div>
                <div className="space-y-3">
                  {PRIORITY_INFO.map((p) => (
                    <div key={p.level} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                          p.level === 1 && "bg-violet-500/20 text-violet-300",
                          p.level === 2 && "bg-blue-500/20 text-blue-300",
                          p.level === 3 && "bg-cyan-500/20 text-cyan-300",
                          p.level === 4 && "bg-slate-500/20 text-slate-300",
                        )}
                      >
                        {p.level}
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          {p.label} to be notified
                        </p>
                        <p className="text-xs text-white/40">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <ContactFormModal onClose={() => setShowAddModal(false)} />
      )}

      {editingContact && (
        <ContactFormModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
        />
      )}

      {deletingContact && (
        <DeleteConfirmModal
          contact={deletingContact}
          onClose={() => setDeletingContact(null)}
          onConfirm={() => deleteContact.mutate({ id: deletingContact.id })}
          isPending={deleteContact.isPending}
        />
      )}
    </div>
  );
}
