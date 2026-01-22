"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { ContactForm } from "./contact-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

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
        <Button onClick={() => setIsAddingContact(true)} variant="secondary">
          Add Contact
        </Button>
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
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No contacts yet. Add your first trusted contact.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact List */}
      {contacts.length > 0 && (
        <div className="flex flex-col gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{contact.name}</h3>
                      {contact.relationship && (
                        <Badge variant="secondary" className="capitalize">
                          {contact.relationship}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        Priority: {contact.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{contact.email}</p>
                    {contact.phone && (
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    )}
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground/70">
                      <span>
                        Email: {contact.notifyByEmail ? "Yes" : "No"}
                      </span>
                      <span>
                        SMS: {contact.notifyBySms ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingContact(contact)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    {deleteConfirmId === contact.id ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDelete(contact.id)}
                          disabled={deleteContact.isPending}
                          variant="destructive"
                          size="sm"
                        >
                          {deleteContact.isPending ? "..." : "Confirm"}
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirmId(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setDeleteConfirmId(contact.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
