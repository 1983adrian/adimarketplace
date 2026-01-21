import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KYCOnboardingRequest {
  business_type: "individual" | "company";
  first_name: string;
  last_name: string;
  birthday?: string; // YYYY-MM-DD
  nationality?: string; // ISO country code
  country_of_residence: string;
  email: string;
  // Company fields
  company_name?: string;
  company_registration?: string;
  // Address
  address_line1: string;
  address_line2?: string;
  city: string;
  region?: string;
  postal_code: string;
  // Bank details
  iban?: string;
  bic?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get MangoPay credentials from secrets
    const mangopayClientId = Deno.env.get("MANGOPAY_CLIENT_ID");
    const mangopayApiKey = Deno.env.get("MANGOPAY_API_KEY");
    const mangopayEnv = Deno.env.get("MANGOPAY_ENVIRONMENT") || "sandbox";

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      throw new Error("Invalid token");
    }

    const body: KYCOnboardingRequest = await req.json();

    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email || !body.country_of_residence) {
      throw new Error("Missing required fields: first_name, last_name, email, country_of_residence");
    }

    // Check if user already has MangoPay ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("mangopay_user_id, mangopay_wallet_id")
      .eq("user_id", user.id)
      .single();

    let mangopayUserId = profile?.mangopay_user_id;
    let mangopayWalletId = profile?.mangopay_wallet_id;

    // If MangoPay is configured, create actual user
    if (mangopayClientId && mangopayApiKey) {
      const mangopayBaseUrl = mangopayEnv === "production" 
        ? "https://api.mangopay.com" 
        : "https://api.sandbox.mangopay.com";

      // Create or update MangoPay Natural/Legal User
      if (!mangopayUserId) {
        const userPayload = body.business_type === "individual" 
          ? {
              FirstName: body.first_name,
              LastName: body.last_name,
              Email: body.email,
              Birthday: body.birthday ? Math.floor(new Date(body.birthday).getTime() / 1000) : null,
              Nationality: body.nationality || body.country_of_residence,
              CountryOfResidence: body.country_of_residence,
              TermsAndConditionsAccepted: true,
              UserCategory: "OWNER",
              Address: {
                AddressLine1: body.address_line1,
                AddressLine2: body.address_line2 || "",
                City: body.city,
                Region: body.region || "",
                PostalCode: body.postal_code,
                Country: body.country_of_residence,
              },
            }
          : {
              Name: body.company_name,
              LegalPersonType: "BUSINESS",
              LegalRepresentativeFirstName: body.first_name,
              LegalRepresentativeLastName: body.last_name,
              LegalRepresentativeEmail: body.email,
              LegalRepresentativeNationality: body.nationality || body.country_of_residence,
              LegalRepresentativeCountryOfResidence: body.country_of_residence,
              CompanyNumber: body.company_registration,
              TermsAndConditionsAccepted: true,
              UserCategory: "OWNER",
              HeadquartersAddress: {
                AddressLine1: body.address_line1,
                AddressLine2: body.address_line2 || "",
                City: body.city,
                Region: body.region || "",
                PostalCode: body.postal_code,
                Country: body.country_of_residence,
              },
            };

        const endpoint = body.business_type === "individual" 
          ? "/v2.01/{ClientId}/users/natural"
          : "/v2.01/{ClientId}/users/legal";

        try {
          const userResponse = await fetch(
            `${mangopayBaseUrl}${endpoint.replace("{ClientId}", mangopayClientId)}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${btoa(`${mangopayClientId}:${mangopayApiKey}`)}`,
              },
              body: JSON.stringify(userPayload),
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            mangopayUserId = userData.Id;
          } else {
            console.error("MangoPay user creation failed:", await userResponse.text());
          }
        } catch (e) {
          console.error("MangoPay API error:", e);
        }
      }

      // Create wallet if user was created
      if (mangopayUserId && !mangopayWalletId) {
        try {
          const walletResponse = await fetch(
            `${mangopayBaseUrl}/v2.01/${mangopayClientId}/wallets`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${btoa(`${mangopayClientId}:${mangopayApiKey}`)}`,
              },
              body: JSON.stringify({
                Owners: [mangopayUserId],
                Description: `Wallet for seller ${user.id}`,
                Currency: "GBP",
              }),
            }
          );

          if (walletResponse.ok) {
            const walletData = await walletResponse.json();
            mangopayWalletId = walletData.Id;
          }
        } catch (e) {
          console.error("MangoPay wallet creation error:", e);
        }
      }
    } else {
      // Simulation mode - generate placeholder IDs
      mangopayUserId = mangopayUserId || `SIM_USER_${Date.now()}`;
      mangopayWalletId = mangopayWalletId || `SIM_WALLET_${Date.now()}`;
    }

    // Update profile with KYC data
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: `${body.first_name} ${body.last_name}`,
        business_type: body.business_type,
        company_name: body.company_name,
        company_registration: body.company_registration,
        kyc_country: body.country_of_residence,
        kyc_status: "pending",
        iban: body.iban,
        mangopay_user_id: mangopayUserId,
        mangopay_wallet_id: mangopayWalletId,
        kyc_submitted_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // Create audit log
    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "kyc_submitted",
      entity_type: "profile",
      entity_id: user.id,
      new_values: {
        business_type: body.business_type,
        country: body.country_of_residence,
        mangopay_user_id: mangopayUserId,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verificare KYC inițiată cu succes",
        data: {
          mangopay_user_id: mangopayUserId,
          mangopay_wallet_id: mangopayWalletId,
          kyc_status: "pending",
          next_step: mangopayClientId 
            ? "Documents will be verified automatically" 
            : "Simulation mode - no actual verification",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("KYC onboarding error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
