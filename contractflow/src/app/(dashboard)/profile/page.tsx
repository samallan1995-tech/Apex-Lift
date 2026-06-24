import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, formatDate } from "@/lib/utils";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    }),
  ]);

  if (!dbUser) redirect("/sign-in");

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Profile" description="Manage your account settings" />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={clerkUser?.imageUrl} />
              <AvatarFallback className="text-lg">{getInitials(dbUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{dbUser.name}</h2>
              <p className="text-muted-foreground">{dbUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {dbUser.role.replace("_", " ")}
                </Badge>
                {dbUser.organization && (
                  <Badge variant="outline" className="text-xs">
                    {dbUser.organization.companyName}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Member since {formatDate(dbUser.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>
            Your account is managed through Clerk. Use the button below to update your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{dbUser.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{dbUser.name}</p>
          </div>
          <div className="pt-2">
            <a
              href="/user-profile"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Edit Profile
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Manage your password and two-factor authentication through your account settings.
          </p>
          <a
            href="/user-profile/security"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Security Settings
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
