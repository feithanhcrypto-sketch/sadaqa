import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NORPO_BASE_URL = "https://api.norpo.io";

interface CreateCheckoutBody {
  amount_cents: number;
  donor_name?: string;
  donor_email?: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: CreateCheckoutBody = await req.json();

    if (!body.amount_cents || body.amount_cents <= 0) {
      return new Response(
        JSON.stringify({ error: "Un montant valide est requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const norpoApiKey = Deno.env.get("NORPO_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: donation, error: dbError } = await supabase
      .from("donations")
      .insert({
        amount_cents: body.amount_cents,
        currency: "EUR",
        status: "pending",
        donor_name: body.donor_name || null,
        donor_email: body.donor_email || null,
        message: body.message || null,
      })
      .select()
      .single();

    if (dbError || !donation) {
      return new Response(
        JSON.stringify({ error: "Impossible de creer le don." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let checkoutUrl: string;
    let norpoPaymentId: string | null = null;

    if (norpoApiKey) {
      const amountDecimal = body.amount_cents / 100;

      const norpoResponse = await fetch(`${NORPO_BASE_URL}/v1/payments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${norpoApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountDecimal,
          currency: "EUR",
          reference: donation.id,
        }),
      });

      if (!norpoResponse.ok) {
        const errText = await norpoResponse.text();
        console.error("Norpo API error:", errText);
        return new Response(
          JSON.stringify({ error: "Erreur lors de la creation du paiement." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const norpoData = await norpoResponse.json();
      norpoPaymentId = norpoData.paymentId || null;
      checkoutUrl = norpoData.order?.url;

      if (!checkoutUrl) {
        console.error("Norpo response missing order.url:", JSON.stringify(norpoData));
        return new Response(
          JSON.stringify({ error: "URL de paiement manquante." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      await supabase
        .from("donations")
        .update({ norpo_reference: norpoPaymentId, updated_at: new Date().toISOString() })
        .eq("id", donation.id);
    } else {
      const origin = new URL(req.url).origin;
      checkoutUrl = `${origin}/?status=success&donation=${donation.id}`;
    }

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl, donation_id: donation.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
