import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LockerRequest {
  courier: string;
  county?: string;
  city?: string;
  search?: string;
  action?: "list" | "generate_awb" | "track";
  awbData?: {
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    recipientName: string;
    recipientPhone: string;
    lockerId: string;
    weight: number;
    codAmount?: number;
    contents: string;
  };
  awbNumber?: string;
}

interface CourierCredentials {
  apiKey: string;
  apiSecret?: string;
  clientId?: string;
  username?: string;
  password?: string;
}

// FAN Courier API integration
async function fanCourierAuth(credentials: CourierCredentials): Promise<string> {
  const response = await fetch("https://api.fancourier.ro/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });
  
  const data = await response.json();
  return data.token;
}

async function getFanCourierLockers(token: string, county?: string): Promise<any[]> {
  const params = new URLSearchParams({ type: "fanbox" });
  if (county) params.append("county", county);
  
  const response = await fetch(`https://api.fancourier.ro/reports/pickup-points?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  const data = await response.json();
  return data.data || [];
}

// Sameday API integration
async function samedayAuth(credentials: CourierCredentials): Promise<string> {
  const response = await fetch("https://api.sameday.ro/api/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${credentials.username}&password=${credentials.password}`,
  });
  
  const data = await response.json();
  return data.token;
}

async function getSamedayLockers(token: string, county?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (county) params.append("county", county);
  
  const response = await fetch(`https://api.sameday.ro/api/locker/list?${params}`, {
    headers: { "X-Auth-Token": token },
  });
  
  const data = await response.json();
  return data.lockers || data.data || [];
}

// Cargus API integration
async function cargusAuth(credentials: CourierCredentials): Promise<string> {
  const response = await fetch("https://urgentcargus.azure-api.net/api/LoginUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": credentials.apiKey!,
    },
    body: JSON.stringify({
      UserName: credentials.username,
      Password: credentials.password,
    }),
  });
  
  const token = await response.text();
  return token.replace(/"/g, "");
}

async function getCargusLockers(token: string, apiKey: string): Promise<any[]> {
  const response = await fetch("https://urgentcargus.azure-api.net/api/Pudo", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": apiKey,
    },
  });
  
  const data = await response.json();
  return data || [];
}

// AWB Generation
async function generateFanCourierAWB(token: string, awbData: any): Promise<any> {
  const response = await fetch("https://api.fancourier.ro/intern-awb", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service: awbData.codAmount ? "FANbox Cont Colector" : "FANbox",
      pickupLocationId: awbData.lockerId,
      package: {
        weight: awbData.weight,
        contents: awbData.contents,
      },
      sender: {
        name: awbData.senderName,
        phone: awbData.senderPhone,
        address: awbData.senderAddress,
      },
      recipient: {
        name: awbData.recipientName,
        phone: awbData.recipientPhone,
      },
      payment: {
        type: awbData.codAmount ? "ramburs" : "expeditor",
        value: awbData.codAmount || 0,
      },
    }),
  });
  
  return await response.json();
}

async function generateSamedayAWB(token: string, awbData: any): Promise<any> {
  const response = await fetch("https://api.sameday.ro/api/awb", {
    method: "POST",
    headers: {
      "X-Auth-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service: "LN", // Locker NextDay
      lockerId: awbData.lockerId,
      packageWeight: awbData.weight,
      insuredValue: 0,
      repayment: awbData.codAmount || 0,
      parcels: [{
        weight: awbData.weight,
        width: 20,
        height: 20,
        length: 30,
      }],
      contactPerson: {
        name: awbData.recipientName,
        phone: awbData.recipientPhone,
      },
      senderAddress: {
        name: awbData.senderName,
        phone: awbData.senderPhone,
        address: awbData.senderAddress,
      },
    }),
  });
  
  return await response.json();
}

// Tracking
async function trackFanCourierAWB(token: string, awbNumber: string): Promise<any> {
  const response = await fetch(`https://api.fancourier.ro/reports/awb-tracking?awb=${awbNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  return await response.json();
}

async function trackSamedayAWB(token: string, awbNumber: string): Promise<any> {
  const response = await fetch(`https://api.sameday.ro/api/awb/tracking?awb=${awbNumber}`, {
    headers: { "X-Auth-Token": token },
  });
  
  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: LockerRequest = await req.json();
    const { courier, county, city, search, action = "list", awbData, awbNumber } = body;

    // Get courier credentials from platform_settings
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("category", "courier_api")
      .eq("key", `${courier}_credentials`)
      .single();

    const credentials: CourierCredentials = settings?.value || {};

    // Check if credentials are configured
    const hasCredentials = credentials.apiKey || credentials.username;
    
    let result: any = { lockers: [], success: false };

    if (action === "list") {
      // Return lockers
      if (!hasCredentials) {
        // No credentials configured - return empty list with clear message
        result = {
          lockers: [],
          isDemo: false,
          message: "Credențialele curierului nu sunt configurate. Configurează API-ul din Admin → Curieri.",
        };
      } else {
        try {
          let lockers: any[] = [];
          
          if (courier === "fan_courier") {
            const token = await fanCourierAuth(credentials);
            const rawLockers = await getFanCourierLockers(token, county);
            lockers = rawLockers.map((l: any) => ({
              id: l.id || l.locationId,
              name: l.name || l.locationName,
              address: l.address,
              city: l.city,
              county: l.county,
              postalCode: l.postalCode,
              lat: l.latitude,
              lng: l.longitude,
              courier: "fan_courier",
              type: "locker",
              schedule: l.schedule || "24/7",
              supportsCOD: true,
              compartments: l.compartments,
            }));
          } else if (courier === "sameday") {
            const token = await samedayAuth(credentials);
            const rawLockers = await getSamedayLockers(token, county);
            lockers = rawLockers.map((l: any) => ({
              id: l.lockerId || l.id,
              name: l.name,
              address: l.address,
              city: l.city,
              county: l.county,
              postalCode: l.postalCode,
              lat: l.lat,
              lng: l.lng,
              courier: "sameday",
              type: "locker",
              schedule: l.schedule || "08:00-22:00",
              supportsCOD: l.supportsCOD !== false,
              compartments: l.boxes,
            }));
          } else if (courier === "cargus") {
            const token = await cargusAuth(credentials);
            const rawLockers = await getCargusLockers(token, credentials.apiKey!);
            lockers = rawLockers.map((l: any) => ({
              id: l.LocationId || l.id,
              name: l.Name || l.name,
              address: l.Address || l.address,
              city: l.City || l.city,
              county: l.County || l.county,
              postalCode: l.PostalCode,
              lat: l.Latitude,
              lng: l.Longitude,
              courier: "cargus",
              type: l.PointType === 5 ? "pudo" : "locker",
              schedule: l.Schedule || "09:00-21:00",
              supportsCOD: l.ServiceCOD !== false,
            }));
          }

          // Filter by search if provided
          if (search) {
            const q = search.toLowerCase();
            lockers = lockers.filter((l: any) =>
              l.name?.toLowerCase().includes(q) ||
              l.address?.toLowerCase().includes(q) ||
              l.city?.toLowerCase().includes(q)
            );
          }

          result = { lockers, success: true };
        } catch (error) {
          console.error("Courier API error:", error);
          result = {
            lockers: [],
            success: false,
            error: "Nu s-a putut conecta la API-ul curierului. Verifică credențialele.",
          };
        }
      }
    } else if (action === "generate_awb" && awbData) {
      if (!hasCredentials) {
        result = {
          success: false,
          error: "Credențialele curierului nu sunt configurate. Nu se pot genera AWB-uri.",
        };
      } else {
        try {
          if (courier === "fan_courier") {
            const token = await fanCourierAuth(credentials);
            result = await generateFanCourierAWB(token, awbData);
          } else if (courier === "sameday") {
            const token = await samedayAuth(credentials);
            result = await generateSamedayAWB(token, awbData);
          }
          result.success = true;
        } catch (error) {
          console.error("AWB generation error:", error);
          result = { success: false, error: "AWB generation failed" };
        }
      }
    } else if (action === "track" && awbNumber) {
      if (!hasCredentials) {
        result = {
          success: false,
          tracking: [],
          error: "Credențialele curierului nu sunt configurate.",
        };
      } else {
        try {
          if (courier === "fan_courier") {
            const token = await fanCourierAuth(credentials);
            result = await trackFanCourierAWB(token, awbNumber);
          } else if (courier === "sameday") {
            const token = await samedayAuth(credentials);
            result = await trackSamedayAWB(token, awbNumber);
          }
          result.success = true;
        } catch (error) {
          result = { success: false, error: "Tracking failed" };
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Courier lockers error:", error);
    return new Response(
      JSON.stringify({ error: error.message, lockers: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
