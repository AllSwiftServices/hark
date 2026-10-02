import { NextResponse } from "next/server";
import { createClient, supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const email = body?.email?.trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        connected_app_email: email,
        connected_app_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("id, email, connected_app_email, connected_app_at")
      .single();

    if (error) {
      console.error("Error connecting app email:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "App connected successfully",
      connected_app_email: data.connected_app_email,
      connected_app_at: data.connected_app_at,
    });
  } catch (error: any) {
    console.error("Connect app error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect app" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({
        connected_app_email: null,
        connected_app_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "App disconnected successfully",
    });
  } catch (error: any) {
    console.error("Disconnect app error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to disconnect app" },
      { status: 500 }
    );
  }
}
