"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

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
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{isEditing ? "Edit Contact" : "Add New Contact"}</CardTitle>
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Relationship */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="relationship">Relationship (optional)</Label>
            <Select
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            >
              <option value="">Select relationship</option>
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel.charAt(0).toUpperCase() + rel.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              min={1}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Lower number = notified first (1 is highest priority)
            </p>
          </div>

          {/* Notification Preferences */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Notification Preferences</p>
            <div className="flex items-center gap-3">
              <Checkbox
                id="notifyByEmail"
                checked={notifyByEmail}
                onCheckedChange={(checked) =>
                  setNotifyByEmail(checked === true)
                }
              />
              <Label htmlFor="notifyByEmail" className="font-normal">
                Notify by email
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="notifyBySms"
                checked={notifyBySms}
                onCheckedChange={(checked) => setNotifyBySms(checked === true)}
                disabled
              />
              <Label
                htmlFor="notifyBySms"
                className="font-normal text-muted-foreground"
              >
                Notify by SMS (coming soon)
              </Label>
            </div>
          </div>

          {/* Feedback Messages */}
          {successMessage && (
            <p className="rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p className="rounded-lg bg-destructive/20 px-4 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : isEditing
                ? "Update Contact"
                : "Add Contact"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
