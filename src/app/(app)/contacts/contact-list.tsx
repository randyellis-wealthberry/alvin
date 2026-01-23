"use client";

import { useState } from "react";
import { Plus, Users, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";
import { ContactForm } from "./contact-form";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { cn } from "~/lib/utils";

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

function getPriorityBadgeStyles(priority: number): string {
  if (priority === 1) return "bg-violet-500/30 text-violet-200";
  if (priority === 2) return "bg-blue-500/30 text-blue-200";
  if (priority === 3) return "bg-cyan-500/30 text-cyan-200";
  return "bg-gray-500/30 text-gray-200";
}

function formatRelationship(rel: string | null): string {
  if (!rel) return "";
  return rel.charAt(0).toUpperCase() + rel.slice(1);
}

export function ContactList() {
  const [contacts] = api.contact.list.useSuspenseQuery();
  const utils = api.useUtils();

  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);

  const deleteContactMutation = api.contact.delete.useMutation({
    onSuccess: async () => {
      await utils.contact.invalidate();
      setDeleteContact(null);
    },
  });

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteContact) {
      deleteContactMutation.mutate({ id: deleteContact.id });
    }
  };

  const handleAddClose = () => {
    setIsAddDialogOpen(false);
  };

  const handleEditClose = () => {
    setEditingContact(null);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="w-full">
      {/* Add Contact Button */}
      <div className="mb-6 flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-500">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-[#1a1a2e] text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <ContactForm onClose={handleAddClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {contacts.length === 0 && (
        <div className="rounded-xl bg-white/5 px-6 py-10 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-white/30" />
          <p className="text-white/70">No contacts yet</p>
          <p className="mt-1 text-sm text-white/50">
            Add your first trusted contact to receive alerts
          </p>
        </div>
      )}

      {/* Contact List */}
      {contacts.length > 0 && (
        <div className="flex flex-col gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                "rounded-xl p-5",
                "bg-white/10 transition-colors hover:bg-white/[0.12]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {contact.name}
                    </h3>
                    {contact.relationship && (
                      <Badge className="bg-white/20 text-white/80 hover:bg-white/25">
                        {formatRelationship(contact.relationship)}
                      </Badge>
                    )}
                    <Badge className={getPriorityBadgeStyles(contact.priority)}>
                      Priority {contact.priority}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-3 text-xs text-white/40">
                    <span>
                      Email alerts: {contact.notifyByEmail ? "On" : "Off"}
                    </span>
                    <span>SMS: {contact.notifyBySms ? "On" : "Off"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(contact)}
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    onClick={() => setDeleteContact(contact)}
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-white/10 bg-[#1a1a2e] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <ContactForm contact={editingContact} onClose={handleEditClose} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteContact}
        onOpenChange={(open) => !open && setDeleteContact(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#1a1a2e] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete {deleteContact?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteContactMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {deleteContactMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
