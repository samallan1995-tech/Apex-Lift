export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  VIEWED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  SIGNED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  EXPIRED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  VOID: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

export const MILESTONE_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  INVOICED: "bg-purple-100 text-purple-700",
  PAID: "bg-green-100 text-green-700",
};

export const PLAN_LIMITS = {
  STARTER: { clients: 25, contracts: 20, teamMembers: 1 },
  PROFESSIONAL: { clients: Infinity, contracts: Infinity, teamMembers: 5 },
  AGENCY: { clients: Infinity, contracts: Infinity, teamMembers: Infinity },
};
