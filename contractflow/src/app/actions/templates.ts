"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_TEMPLATES = [
  {
    name: "Freelance Agreement",
    description: "General freelance services agreement",
    category: "Freelance",
    content: `<h1>Freelance Services Agreement</h1>
<p>This Freelance Services Agreement ("Agreement") is entered into as of {{start_date}} between {{company_name}} ("Client") and the service provider.</p>
<h2>1. Services</h2>
<p>The service provider agrees to provide the following services: [Description of services]</p>
<h2>2. Payment</h2>
<p>The Client agrees to pay the total amount of {{contract_value}} for the services described herein.</p>
<h2>3. Timeline</h2>
<p>Services will commence on {{start_date}} and be completed by {{end_date}}.</p>
<h2>4. Intellectual Property</h2>
<p>Upon receipt of full payment, all work product created under this Agreement shall become the sole property of the Client.</p>
<h2>5. Confidentiality</h2>
<p>Both parties agree to maintain the confidentiality of proprietary information shared during the course of this agreement.</p>
<h2>6. Termination</h2>
<p>Either party may terminate this Agreement with 14 days written notice.</p>
<p>By signing below, both parties agree to the terms and conditions set forth in this Agreement.</p>`,
    variables: ["client_name", "company_name", "contract_value", "start_date", "end_date"],
    isDefault: true,
  },
  {
    name: "Marketing Retainer",
    description: "Monthly marketing services retainer agreement",
    category: "Marketing",
    content: `<h1>Marketing Retainer Agreement</h1>
<p>This Marketing Retainer Agreement is entered into as of {{start_date}} between {{client_name}} ("Client") and {{company_name}} ("Agency").</p>
<h2>1. Retainer Services</h2>
<p>Agency agrees to provide monthly marketing services as mutually agreed upon, for a monthly retainer of {{contract_value}}.</p>
<h2>2. Scope of Work</h2>
<p>Services include but are not limited to: social media management, content creation, campaign management, and analytics reporting.</p>
<h2>3. Term</h2>
<p>This agreement commences on {{start_date}} and continues on a monthly basis until terminated by either party.</p>
<h2>4. Payment Terms</h2>
<p>Invoices will be issued on the 1st of each month, payable within 14 days.</p>
<h2>5. Termination</h2>
<p>Either party may terminate with 30 days written notice.</p>`,
    variables: ["client_name", "company_name", "contract_value", "start_date"],
    isDefault: true,
  },
  {
    name: "Consulting Agreement",
    description: "Professional consulting services agreement",
    category: "Consulting",
    content: `<h1>Consulting Services Agreement</h1>
<p>This Consulting Services Agreement is made between {{client_name}} ("Client") and {{company_name}} ("Consultant").</p>
<h2>1. Consulting Services</h2>
<p>Consultant will provide professional consulting services as outlined in Schedule A, from {{start_date}} to {{end_date}}.</p>
<h2>2. Compensation</h2>
<p>Total compensation: {{contract_value}}, payable as agreed in the payment schedule.</p>
<h2>3. Independent Contractor</h2>
<p>Consultant is an independent contractor, not an employee of Client.</p>
<h2>4. Deliverables</h2>
<p>Consultant will provide written reports, recommendations, and support as mutually agreed.</p>
<h2>5. Non-Disclosure</h2>
<p>Consultant agrees to maintain strict confidentiality of all Client information.</p>`,
    variables: ["client_name", "company_name", "contract_value", "start_date", "end_date"],
    isDefault: true,
  },
  {
    name: "Web Development Contract",
    description: "Website and web application development agreement",
    category: "Development",
    content: `<h1>Web Development Agreement</h1>
<p>This Web Development Agreement is entered into between {{client_name}} ("Client") and {{company_name}} ("Developer").</p>
<h2>1. Project Scope</h2>
<p>Developer will design and develop a website/application as described in the project specification document.</p>
<h2>2. Timeline</h2>
<p>Project commencement: {{start_date}}. Estimated completion: {{end_date}}.</p>
<h2>3. Investment</h2>
<p>Total project investment: {{contract_value}}, payable per the milestone schedule.</p>
<h2>4. Revisions</h2>
<p>This agreement includes [X] rounds of revisions. Additional revisions will be billed separately.</p>
<h2>5. Hosting & Maintenance</h2>
<p>Post-launch hosting and maintenance is not included unless specified in a separate agreement.</p>
<h2>6. Ownership</h2>
<p>Upon final payment, Client receives full ownership of all project assets and source code.</p>`,
    variables: ["client_name", "company_name", "contract_value", "start_date", "end_date"],
    isDefault: true,
  },
  {
    name: "Coaching Agreement",
    description: "Coaching and mentorship services agreement",
    category: "Coaching",
    content: `<h1>Coaching Services Agreement</h1>
<p>This Coaching Agreement is entered into between {{client_name}} ("Client") and {{company_name}} ("Coach").</p>
<h2>1. Coaching Services</h2>
<p>Coach will provide [number] coaching sessions per month, each approximately [duration] long.</p>
<h2>2. Investment</h2>
<p>Total investment: {{contract_value}} for the agreed coaching period from {{start_date}} to {{end_date}}.</p>
<h2>3. Commitment</h2>
<p>Both parties commit to showing up prepared and on time for all scheduled sessions.</p>
<h2>4. Cancellation Policy</h2>
<p>Sessions cancelled with less than 24 hours notice will be forfeited unless rescheduled within the same month.</p>
<h2>5. Confidentiality</h2>
<p>All coaching conversations are strictly confidential.</p>
<h2>6. Results Disclaimer</h2>
<p>While Coach will provide their best guidance and support, results depend on Client's actions and commitment.</p>`,
    variables: ["client_name", "company_name", "contract_value", "start_date", "end_date"],
    isDefault: true,
  },
];

export async function getTemplates(orgId?: string) {
  const defaultTemplates = await prisma.contractTemplate.findMany({
    where: { isDefault: true, organizationId: null },
    orderBy: { name: "asc" },
  });

  if (defaultTemplates.length === 0) {
    await prisma.contractTemplate.createMany({
      data: DEFAULT_TEMPLATES.map((t) => ({
        ...t,
        variables: t.variables,
      })),
      skipDuplicates: true,
    });

    const seeded = await prisma.contractTemplate.findMany({
      where: { isDefault: true, organizationId: null },
      orderBy: { name: "asc" },
    });

    const orgTemplates = orgId
      ? await prisma.contractTemplate.findMany({ where: { organizationId: orgId } })
      : [];

    return [...seeded, ...orgTemplates];
  }

  const orgTemplates = orgId
    ? await prisma.contractTemplate.findMany({ where: { organizationId: orgId } })
    : [];

  return [...defaultTemplates, ...orgTemplates];
}

export async function createTemplate(data: {
  name: string;
  description?: string;
  category: string;
  content: string;
  variables?: string[];
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) throw new Error("Organization not found");

  const template = await prisma.contractTemplate.create({
    data: {
      organizationId: user.organization.id,
      name: data.name,
      description: data.description,
      category: data.category,
      content: data.content,
      variables: data.variables || [],
    },
  });

  revalidatePath("/contracts/new");
  return template;
}

export async function updateTemplate(
  id: string,
  data: { name?: string; description?: string; content?: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) throw new Error("Organization not found");

  const template = await prisma.contractTemplate.findUnique({ where: { id } });
  if (!template || template.organizationId !== user.organization.id) {
    throw new Error("Template not found or not owned by your organization");
  }

  const updated = await prisma.contractTemplate.update({
    where: { id },
    data,
  });

  revalidatePath("/contracts/new");
  return updated;
}

export async function deleteTemplate(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) throw new Error("Organization not found");

  const template = await prisma.contractTemplate.findUnique({ where: { id } });
  if (!template || template.organizationId !== user.organization.id) {
    throw new Error("Cannot delete default or unowned template");
  }

  await prisma.contractTemplate.delete({ where: { id } });
  revalidatePath("/contracts/new");
}

export async function cloneTemplate(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) throw new Error("Organization not found");

  const source = await prisma.contractTemplate.findUnique({ where: { id } });
  if (!source) throw new Error("Template not found");

  const cloned = await prisma.contractTemplate.create({
    data: {
      organizationId: user.organization.id,
      name: `${source.name} (Copy)`,
      description: source.description,
      category: source.category,
      content: source.content,
      variables: source.variables,
    },
  });

  revalidatePath("/contracts/new");
  return cloned;
}
