import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateContractPDF } from "@/lib/pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { organizationId: true },
  });

  const contract = await prisma.contract.findFirst({
    where: { id, organizationId: user?.organizationId ?? "" },
    include: {
      client: true,
      organization: true,
      milestones: { orderBy: { order: "asc" } },
    },
  });

  if (!contract) return Response.json({ error: "Not found" }, { status: 404 });

  try {
    const pdf = await generateContractPDF(contract, contract.organization, contract.client);
    const filename = `contract-${contract.contractNumber}.pdf`;

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (err) {
    console.error("[pdf/contract] Generation failed:", err);
    return Response.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
