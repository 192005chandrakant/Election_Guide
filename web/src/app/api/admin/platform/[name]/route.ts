import { NextResponse, NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/admin-firestore";

export async function GET(request: NextRequest, props: { params: Promise<{ name: string }> }) {
  const params = await props.params;
  const contentName = params.name;

  try {
    const db = getAdminFirestore();
    const ref = db.collection("platform_content").doc(contentName);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const data = snap.data();
    return NextResponse.json({ content: data || {} });
  } catch (error) {
    console.error(`GET /api/admin/platform/${contentName} failed:`, error);
    return NextResponse.json(
      { error: "Failed to fetch content", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ name: string }> }) {
  const params = await props.params;
  const contentName = params.name;

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "object") {
      return NextResponse.json({ error: "Invalid content format" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const ref = db.collection("platform_content").doc(contentName);

    await ref.update({
      ...content,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Content saved successfully" });
  } catch (error) {
    console.error(`PUT /api/admin/platform/${contentName} failed:`, error);
    return NextResponse.json(
      { error: "Failed to save content", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
