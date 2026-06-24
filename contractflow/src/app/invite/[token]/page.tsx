import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AcceptInviteClient } from "@/components/team/accept-invite-client";
import { FileTextIcon, ShieldCheckIcon, XCircleIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Accept Team Invite" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { userId } = await auth();

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invite Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            This invite link is invalid or has already been used.
          </p>
        </div>
      </div>
    );
  }

  if (invite.accepted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invite Already Accepted
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            This invite has already been accepted.
          </p>
          <a
            href="/dashboard"
            className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-indigo-600 text-white h-10 px-6 hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invite Expired
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            This invite expired on {formatDate(invite.expiresAt)}. Please ask for a new invite.
          </p>
        </div>
      </div>
    );
  }

  if (!userId) {
    const signUpUrl = `/sign-up?redirect_url=/invite/${token}`;
    redirect(signUpUrl);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FileTextIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">ContractFlow</span>
        </div>
      </div>

      <div className="max-w-md w-full mt-16">
        <AcceptInviteClient
          token={token}
          organizationName={invite.organization.companyName}
          role={invite.role}
          email={invite.email}
          expiresAt={invite.expiresAt.toISOString()}
        />
      </div>
    </div>
  );
}
