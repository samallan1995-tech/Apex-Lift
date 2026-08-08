import { PrismaClient, UserRole, ContractStatus, InvoiceStatus, SubscriptionPlan, ActivityType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed contract templates
  const templates = [
    {
      name: "Freelance Services Agreement",
      category: "Freelance",
      description: "Standard agreement for freelance services",
      isDefault: true,
      content: `<h1>Freelance Services Agreement</h1>
<p>This agreement is entered into between <strong>{{company_name}}</strong> ("Service Provider") and <strong>{{client_name}}</strong> ("Client") on {{start_date}}.</p>
<h2>1. Services</h2>
<p>The Service Provider agrees to provide the following services as outlined in the project brief and any attached documentation.</p>
<h2>2. Payment</h2>
<p>The Client agrees to pay a total fee of {{contract_value}} for the services outlined. Payment terms are as specified in the milestones section.</p>
<h2>3. Timeline</h2>
<p>Work will commence on {{start_date}} and is expected to be completed by {{end_date}}, subject to timely provision of required assets and feedback from the Client.</p>
<h2>4. Intellectual Property</h2>
<p>Upon receipt of full payment, all intellectual property rights for work created under this agreement will be transferred to the Client.</p>
<h2>5. Confidentiality</h2>
<p>Both parties agree to keep all project details and proprietary information confidential during and after the term of this agreement.</p>
<h2>6. Termination</h2>
<p>Either party may terminate this agreement with 14 days written notice. Work completed to the point of termination will be invoiced accordingly.</p>`,
    },
    {
      name: "Monthly Retainer Agreement",
      category: "Retainer",
      description: "Ongoing monthly retainer for agencies and consultants",
      isDefault: true,
      content: `<h1>Monthly Retainer Agreement</h1>
<p>This retainer agreement is made between <strong>{{company_name}}</strong> ("Agency") and <strong>{{client_name}}</strong> ("Client") commencing {{start_date}}.</p>
<h2>1. Retainer Services</h2>
<p>The Agency will provide ongoing services as agreed, with a monthly retainer of {{contract_value}}.</p>
<h2>2. Payment Terms</h2>
<p>The retainer fee is due on the 1st of each month. Late payments will incur a 5% monthly penalty.</p>
<h2>3. Scope of Work</h2>
<p>Services are limited to those specified in the agreed scope. Additional work outside the scope will be quoted separately.</p>
<h2>4. Communication</h2>
<p>Regular updates will be provided monthly. The Client may request status updates at any time.</p>
<h2>5. Termination</h2>
<p>Either party may terminate this agreement with 30 days written notice.</p>`,
    },
    {
      name: "Web Development Contract",
      category: "Development",
      description: "Project-based contract for web development work",
      isDefault: true,
      content: `<h1>Web Development Project Contract</h1>
<p>This contract is between <strong>{{company_name}}</strong> ("Developer") and <strong>{{client_name}}</strong> ("Client").</p>
<h2>1. Project Scope</h2>
<p>The Developer will design and develop a website as detailed in the project specification document. Total project value: {{contract_value}}.</p>
<h2>2. Project Timeline</h2>
<p>The project will start on {{start_date}} and be delivered by {{end_date}}.</p>
<h2>3. Payment Schedule</h2>
<p>50% deposit is required upon signing. The remaining 50% is due upon final delivery.</p>
<h2>4. Revisions</h2>
<p>This contract includes up to 3 rounds of revisions. Additional revisions will be billed at the standard hourly rate.</p>
<h2>5. Acceptance</h2>
<p>The Client has 7 days to review and accept delivered work. Silence after 7 days constitutes acceptance.</p>`,
    },
    {
      name: "Consulting Agreement",
      category: "Consulting",
      description: "Professional consulting services agreement",
      isDefault: true,
      content: `<h1>Consulting Services Agreement</h1>
<p>This Consulting Agreement ("Agreement") is made between <strong>{{company_name}}</strong> ("Consultant") and <strong>{{client_name}}</strong> ("Client").</p>
<h2>1. Consulting Services</h2>
<p>The Consultant will provide professional advisory and consulting services as agreed between the parties. Total engagement value: {{contract_value}}.</p>
<h2>2. Term</h2>
<p>This Agreement shall commence on {{start_date}} and continue until {{end_date}}, unless terminated earlier.</p>
<h2>3. Fees</h2>
<p>The Client agrees to pay the fees as outlined in the payment schedule attached to this Agreement.</p>
<h2>4. Independent Contractor</h2>
<p>The Consultant is an independent contractor and not an employee, agent, or partner of the Client.</p>
<h2>5. Confidentiality</h2>
<p>The Consultant agrees to keep confidential all proprietary information of the Client.</p>
<h2>6. Limitation of Liability</h2>
<p>The Consultant's total liability shall not exceed the fees paid under this Agreement.</p>`,
    },
    {
      name: "Coaching Agreement",
      category: "Coaching",
      description: "Life or business coaching services agreement",
      isDefault: true,
      content: `<h1>Coaching Services Agreement</h1>
<p>This Coaching Agreement is between <strong>{{company_name}}</strong> ("Coach") and <strong>{{client_name}}</strong> ("Client") effective {{start_date}}.</p>
<h2>1. Coaching Services</h2>
<p>The Coach will provide professional coaching services as agreed, with a total investment of {{contract_value}}.</p>
<h2>2. Programme Duration</h2>
<p>The coaching programme will run from {{start_date}} to {{end_date}}.</p>
<h2>3. Sessions</h2>
<p>Sessions will be conducted as agreed. The Client is responsible for attending all scheduled sessions. Cancellations require 24 hours notice.</p>
<h2>4. Confidentiality</h2>
<p>All coaching conversations are kept strictly confidential, except where disclosure is required by law.</p>
<h2>5. Disclaimer</h2>
<p>Coaching is not therapy or counselling. The Coach is not a licensed therapist. Clients seeking mental health support should consult a qualified professional.</p>
<h2>6. Results</h2>
<p>The Coach does not guarantee specific results. Outcomes depend on the Client's active participation and commitment.</p>`,
    },
  ];

  for (const template of templates) {
    const existing = await prisma.contractTemplate.findFirst({
      where: { name: template.name, isDefault: true },
    });
    if (!existing) {
      await prisma.contractTemplate.create({ data: template });
    }
  }

  console.log(`Seeded ${templates.length} contract templates`);
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
