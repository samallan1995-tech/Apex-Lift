"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, SearchIcon, BuildingIcon, MailIcon, PhoneIcon, FileTextIcon, ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { formatCurrency, getInitials } from "@/lib/utils";

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  totalRevenue: number;
  _count: { contracts: number; invoices: number };
}

interface ClientsPageClientProps {
  initialClients: Client[];
  initialSearch: string;
  organizationId: string;
}

export function ClientsPageClient({ initialClients, initialSearch, organizationId }: ClientsPageClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setSearch(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("search", value);
      router.push(`/clients?${params.toString()}`);
    });
  }

  const clients = initialClients;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${clients.length} client${clients.length !== 1 ? "s" : ""}`}
        actions={
          <Button onClick={() => setShowAddDialog(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{clients.length}</div>
            <div className="text-sm text-muted-foreground">Total Clients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{clients.filter((c) => c._count.contracts > 0).length}</div>
            <div className="text-sm text-muted-foreground">Active Clients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {clients.reduce((sum, c) => sum + c._count.contracts, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Contracts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {formatCurrency(clients.reduce((sum, c) => sum + c.totalRevenue, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Client grid */}
      {clients.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <BuildingIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
          <p className="text-muted-foreground mb-4">Add your first client to get started.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      {getInitials(client.companyName)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{client.companyName}</h3>
                      <p className="text-xs text-muted-foreground truncate">{client.contactName}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MailIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <PhoneIcon className="w-3 h-3 flex-shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileTextIcon className="w-3 h-3" />
                        {client._count.contracts}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ReceiptIcon className="w-3 h-3" />
                        {client._count.invoices}
                      </span>
                    </div>
                    {client.totalRevenue > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {formatCurrency(client.totalRevenue)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AddClientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        organizationId={organizationId}
      />
    </div>
  );
}
