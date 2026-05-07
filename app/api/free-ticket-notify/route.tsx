import { NextRequest, NextResponse } from "next/server";
import { getOrderById, payOrderHandler } from "@/lib/actions";

export async function POST(req: NextRequest) {
  try {
    const r = await req.json();
    if (r.orderId) {
      const order = await getOrderById(r.orderId);
      if (order && order.status === "PENDING") {
        await payOrderHandler(r.orderId);
        return NextResponse.json({ data: "OK" }, { status: 201 });
      } else {
        return NextResponse.json(
          { error: "El ID no pertenece a ninguna order" },
          { status: 500 },
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
