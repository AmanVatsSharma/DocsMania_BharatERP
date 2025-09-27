import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const found = await (prisma as any).docLink.findUnique({ where: { id: params.id } });
    if (!found) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Link not found" } },
        { status: 404 }
      );
    }
    await (prisma as any).docLink.delete({ where: { id: params.id } });
    logger.info("Deleted link", { id: params.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("DELETE /api/links/[id] error", error);
    return NextResponse.json(
      { ok: false, error: { code: "DELETE_FAILED", message: "Failed to delete link" } },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import logger from "@/lib/logger";

// export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     await (prisma as any).docLink.delete({ where: { id: params.id } });
//     return NextResponse.json({ ok: true });
//   } catch (error) {
//     logger.error("DELETE /api/links/[id] error", error);
//     return NextResponse.json(
//       { ok: false, error: { code: "DELETE_FAILED", message: "Failed to delete link" } },
//       { status: 500 }
//     );
//   }
// }


