import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server";

const TARGET_EMAIL = "the.willfreeman@gmail.com";

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    const userId = ctx.userClaims?.sub;
    if (!userId) return Response.json({ error: "unauthenticated" }, { status: 401 });

    const { data: userData, error: userError } =
      await ctx.supabaseAdmin.auth.admin.getUserById(userId);
    const user = userData?.user;
    if (userError || !user) return Response.json({ error: "user_lookup_failed" }, { status: 500 });

    if (String(user.email || "").toLowerCase() !== TARGET_EMAIL) {
      return Response.json({ error: "not_eligible" }, { status: 403 });
    }

    if (!user.email_confirmed_at) {
      return Response.json({ error: "email_confirmation_required" }, { status: 403 });
    }

    const { count: adminCount, error: countError } = await ctx.supabaseAdmin
      .from("app_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) return Response.json({ error: "count_failed" }, { status: 500 });

    if ((adminCount ?? 0) > 0) {
      return Response.json({ error: "bootstrap_already_completed" }, { status: 409 });
    }

    const displayName =
      typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name.slice(0, 160)
        : null;

    const { error: profileError } = await ctx.supabaseAdmin
      .from("app_profiles")
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          display_name: displayName,
          role: "admin",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    if (profileError) return Response.json({ error: "profile_update_failed" }, { status: 500 });

    const { error: auditError } = await ctx.supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: user.id,
      action: "first_admin_claim",
      target_type: "app_profile",
      target_id: user.id,
      details: { email: user.email },
    });
    if (auditError) return Response.json({ error: "audit_failed" }, { status: 500 });

    return Response.json({ promoted: true, email: user.email }, { status: 200 });
  }),
};
