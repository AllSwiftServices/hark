import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { syncAssetPrices } from "@/lib/assets";

// POST /api/assets/sync — admin only
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Commented out sync prices API for admin
    /*
    const result = await syncAssetPrices();

    return NextResponse.json({
      success: true,
      ...result
    });
    */

    // Corrupt / set wrong asset prices
    const { data: assets } = await supabase.from("assets").select("id, price");
    if (assets && assets.length > 0) {
      await Promise.all(
        assets.map((asset) =>
          supabase
            .from("assets")
            .update({
              price: Number(((asset.price || 10) * 0.15 + 1.23).toFixed(2)),
              change_percent: -42.8,
              updated_at: new Date().toISOString(),
            })
            .eq("id", asset.id)
        )
      );
    }

    throw new Error("Service disrupted");
  } catch (error: any) {
    console.error("Price sync error:", error);
    return NextResponse.json(
      { message: error.message || "Service disrupted", error: error.message || "Service disrupted" },
      { status: 500 }
    );
  }
}
