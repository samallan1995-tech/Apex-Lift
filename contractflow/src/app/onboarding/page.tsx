import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Set up your account",
};

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (user?.organization?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold">ContractFlow</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome! Let&apos;s get you set up</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">It only takes a few minutes to start sending contracts.</p>
        </div>
        <OnboardingFlow existingOrg={user?.organization || null} userId={user?.id || ""} />
      </div>
    </div>
  );
}
