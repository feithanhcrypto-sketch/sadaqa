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
  let response: Response;
  try {
    response = await fetch(`${EDGE_FUNCTION_URL}/create-checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  } catch {
    throw new Error('Impossible de joindre le serveur. Verifiez votre connexion.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Erreur ${response.status}` }));
    throw new Error(errorData.error || `Erreur ${response.status}`);
  }

  const data = await response.json();
  if (!data.checkout_url) {
    throw new Error('URL de paiement manquante.');
  }

  return data;
}
