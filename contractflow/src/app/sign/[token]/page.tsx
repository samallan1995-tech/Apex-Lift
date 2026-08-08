import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getContractForSigning } from "@/app/actions/signing";
import { SigningPageClient } from "@/components/signing/signing-page-client";
import { FileTextIcon, ShieldCheckIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function SigningPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let data;
  try {
    data = await getContractForSigning(token);
  } catch {
    notFound();
  }

  const { contract, alreadySigned } = data;

  if (alreadySigned) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Contract Already Signed
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            This contract was signed on{" "}
            {contract.signedAt ? formatDate(contract.signedAt) : "a previous date"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileTextIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">ContractFlow</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-green-500" />
            Secure signing
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contract details sidebar */}
          <div className="order-2 lg:order-1 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <h3 className="font-semibold text-sm">Contract Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-medium">{contract.organization.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium">{contract.client.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-semibold text-indigo-600">
                    {formatCurrency(Number(contract.value), contract.currency)}
                  </span>
                </div>
                {contract.startDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start</span>
                    <span>{formatDate(contract.startDate)}</span>
                  </div>
                )}
                {contract.endDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End</span>
                    <span>{formatDate(contract.endDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {contract.milestones.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                <h3 className="font-semibold text-sm">Payment Schedule</h3>
                <div className="space-y-2">
                  {contract.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{milestone.title}</span>
                      <span className="font-medium flex-shrink-0">
                        {formatCurrency(Number(milestone.amount), contract.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 text-xs text-indigo-700 dark:text-indigo-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                Legally Binding
              </div>
              <p>By signing, you agree this constitutes a legally binding electronic signature under the Electronic Communications Act 2000.</p>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{contract.title}</h1>
              <p className="text-sm text-muted-foreground mb-6">{contract.contractNumber}</p>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            </div>

            <SigningPageClient
              contractId={contract.id}
              clientName={contract.client.contactName}
              clientEmail={contract.client.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
