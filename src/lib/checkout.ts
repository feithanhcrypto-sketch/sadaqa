const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

interface CreateCheckoutResponse {
  checkout_url: string;
  donation_id: string;
}

export async function createCheckoutSession(params: {
  amount_cents: number;
  donor_name?: string;
  donor_email?: string;
  message?: string;
}): Promise<CreateCheckoutResponse> {
  const response = await fetch(`${EDGE_FUNCTION_URL}/create-checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erreur reseau' }));
    throw new Error(errorData.error || `Erreur ${response.status}`);
  }

  const data = await response.json();
  if (!data.checkout_url) {
    throw new Error('URL de paiement manquante.');
  }

  return data;
}
