"use client"

import { useState } from "react"
import { api } from "~/trpc/react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import { cn } from "~/lib/utils"

const RELATIONSHIP_OPTIONS = [
  "spouse",
  "child",
  "sibling",
  "parent",
  "friend",
  "other",
] as const

const PRIORITY_OPTIONS = [1, 2, 3, 4] as const

type Contact = {
  id: string
  name: string
  email: string
  phone: string | null
  relationship: string | null
  priority: number
  notifyByEmail: boolean
  notifyBySms: boolean
}

type ContactFormProps = {
  contact?: Contact
  onClose: () => void
}

export function ContactForm({ contact, onClose }: ContactFormProps) {
  const utils = api.useUtils()
  const isEditing = !!contact

  const [name, setName] = useState(contact?.name ?? "")
  const [email, setEmail] = useState(contact?.email ?? "")
  const [phone, setPhone] = useState(contact?.phone ?? "")
  const [relationship, setRelationship] = useState(contact?.relationship ?? "")
  const [priority, setPriority] = useState(contact?.priority ?? 1)
  const [notifyByEmail, setNotifyByEmail] = useState(
    contact?.notifyByEmail ?? true
  )
  const [notifyBySms, setNotifyBySms] = useState(contact?.notifyBySms ?? false)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createContact = api.contact.create.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate()
      setSuccessMessage("Contact added successfully!")
      setErrorMessage(null)
      setTimeout(() => {
        onClose()
      }, 1000)
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to add contact")
      setSuccessMessage(null)
    },
  })

  const updateContact = api.contact.update.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate()
      setSuccessMessage("Contact updated successfully!")
      setErrorMessage(null)
      setTimeout(() => {
        onClose()
      }, 1000)
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to update contact")
      setSuccessMessage(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

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
      })
    } else {
      createContact.mutate({
        name,
        email,
        phone: phone || undefined,
        relationship: relationship || undefined,
        priority,
        notifyByEmail,
        notifyBySms,
      })
    }
  }

  const isPending = createContact.isPending || updateContact.isPending

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-white/80">
          Name *
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="John Doe"
          className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-violet-500"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-white/80">
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="john@example.com"
          className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-violet-500"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone" className="text-white/80">
          Phone (optional)
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-violet-500"
        />
      </div>

      {/* Relationship */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="relationship" className="text-white/80">
          Relationship (optional)
        </Label>
        <select
          id="relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-violet-500 focus:outline-none"
        >
          <option value="" className="bg-[#1a1a2e]">
            Select relationship
          </option>
          {RELATIONSHIP_OPTIONS.map((rel) => (
            <option key={rel} value={rel} className="bg-[#1a1a2e]">
              {rel.charAt(0).toUpperCase() + rel.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-2">
        <Label className="text-white/80">Alert Priority</Label>
        <div className="flex gap-2">
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                priority === p
                  ? "bg-violet-600 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/50">
          Lower number = notified earlier during escalation
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="flex flex-col gap-3">
        <Label className="text-white/80">Notification Preferences</Label>
        <div className="flex items-center gap-3">
          <Checkbox
            id="notifyByEmail"
            checked={notifyByEmail}
            onCheckedChange={(checked) => setNotifyByEmail(checked === true)}
            className="border-white/30 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
          />
          <Label htmlFor="notifyByEmail" className="font-normal text-white/70">
            Notify by email
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="notifyBySms"
            checked={notifyBySms}
            onCheckedChange={(checked) => setNotifyBySms(checked === true)}
            disabled
            className="border-white/20"
          />
          <Label
            htmlFor="notifyBySms"
            className="font-normal text-white/40"
          >
            Notify by SMS (coming soon)
          </Label>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <p className="rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-400">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {/* Submit Button */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          className="flex-1 text-white/70 hover:bg-white/10 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-violet-600 hover:bg-violet-500"
        >
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Contact"
              : "Add Contact"}
        </Button>
      </div>
    </form>
  )
}
