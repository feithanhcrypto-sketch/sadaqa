import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function verifySignature(rawBody: string, sigHeader: string, secret: string): Promise<boolean> {
  // Norpo-Signature format: "t=1790497260000,v1=5f2c..."
  const parts = sigHeader.split(",").map((p) => p.trim());
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tPart || !v1Part) return false;

  const t = tPart.slice(2);
  const v1 = v1Part.slice(3);
  const signedPayload = `${t}.${rawBody}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );

  const expectedSig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig === v1;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await req.text();

    // Verify Norpo-Signature header (HMAC-SHA256)
    const sigHeader = req.headers.get("Norpo-Signature");
    if (sigHeader) {
      const webhookSecret = Deno.env.get("NORPO_WEBHOOK_SECRET");
      if (webhookSecret) {
        const valid = await verifySignature(rawBody, sigHeader, webhookSecret);
        if (!valid) {
          return new Response(
            JSON.stringify({ error: "Signature invalide." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }
    }

    const event = JSON.parse(rawBody);

    // Norpo webhook: { id, event: "payment.settled" | "payment.failed", data: { paymentId, reference, amount, currency } }
    const reference = event.data?.reference;
    const eventType = event.event;

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Reference manquante." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let dbStatus = "pending";
    if (eventType === "payment.settled") {
      dbStatus = "paid";
    } else if (eventType === "payment.failed") {
      dbStatus = "failed";
    }

    const { error } = await supabase
      .from("donations")
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq("id", reference);

    if (error) {
      console.error("Webhook DB error:", error);
      return new Response(
        JSON.stringify({ error: "Erreur de mise a jour." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("norpo-webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur webhook." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
