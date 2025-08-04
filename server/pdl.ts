import { cache } from './middleware/cache';

// People Data Labs API integration
interface PDLPersonResponse {
  status: number;
  data?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    job_title?: string;
    job_company_name?: string;
    emails?: Array<{
      address: string;
      type?: string;
    }>;
    phone_numbers?: Array<{
      number: string;
      type?: string;
    }>;
    linkedin_url?: string;
    profiles?: Array<{
      network: string;
      url: string;
    }>;
  };
  error?: {
    type: string;
    message: string;
  };
}

const PDL_API_KEY = process.env.PDL_API_KEY;
const PDL_ENDPOINT = "https://api.peopledatalabs.com/v5/person/enrich";

export async function enrichPersonWithPDL(email: string): Promise<{
  phone?: string;
  fullName?: string;
  title?: string;
  linkedinUrl?: string;
  success: boolean;
  error?: string;
}> {
  try {
    // Security: Validate email format before API call
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Invalid email format',
      };
    }

    // Security: Check API key availability without logging it
    if (!PDL_API_KEY) {
      console.error('❌ PDL API key not configured in environment variables');
      return {
        success: false,
        error: 'PDL API key not configured',
      };
    }

    // Performance: Check cache first
    const cacheKey = `pdl:${email}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`📋 Using cached PDL data for ${email.substring(0, 3)}***`);
      return cachedResult;
    }

    console.log(`🔍 Making PDL API request for email: ${email.substring(0, 3)}***`);
    console.log(`📡 PDL Endpoint: ${PDL_ENDPOINT}`);
    
    const requestBody = {
      email: email,
      min_likelihood: 3,
    };
    console.log(`📤 Request body:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(PDL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": PDL_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📥 PDL Response status: ${response.status}`);
    console.log(`📥 PDL Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ PDL API error (${response.status}):`, errorText);
      return {
        success: false,
        error: `PDL API returned ${response.status}: ${errorText}`,
      };
    }

    const result: PDLPersonResponse = await response.json();
    
    // Log full response for debugging
    console.log("📋 FULL PDL API RESPONSE:", JSON.stringify(result, null, 2));

    if (result.status === 200 && result.data) {
      const data = result.data;
      
      // Extract phone number (prioritize mobile/work numbers)
      let phone: string | undefined;
      if (data.phone_numbers && data.phone_numbers.length > 0) {
        // Look for mobile first, then work, then any
        const mobilePhone = data.phone_numbers.find(p => p.type?.toLowerCase().includes('mobile'));
        const workPhone = data.phone_numbers.find(p => p.type?.toLowerCase().includes('work'));
        phone = mobilePhone?.number || workPhone?.number || data.phone_numbers[0].number;
      }

      // Extract LinkedIn URL
      let linkedinUrl: string | undefined;
      if (data.linkedin_url) {
        linkedinUrl = data.linkedin_url;
      } else if (data.profiles) {
        const linkedinProfile = data.profiles.find(p => p.network.toLowerCase() === 'linkedin');
        linkedinUrl = linkedinProfile?.url;
      }

      const enrichedData = {
        phone,
        fullName: data.full_name,
        title: data.job_title,
        linkedinUrl,
        success: true,
      };

      console.log(`✅ PDL enrichment successful for ${email}:`, enrichedData);
      
      // Performance: Cache successful results for 1 hour
      cache.set(cacheKey, enrichedData, 60 * 60 * 1000);
      
      return enrichedData;
    } else {
      console.log(`⚠️ No real match found for ${email} (status: ${result.status})`);
      const failureResult = {
        success: false,
        error: result.error?.message || '⚠️ No real match found',
      };
      
      // Performance: Cache negative results for 30 minutes to reduce API calls
      cache.set(cacheKey, failureResult, 30 * 60 * 1000);
      
      return failureResult;
    }
  } catch (error) {
    console.error(`💥 PDL API request failed for ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function enrichTopLeads(leads: Array<{ email: string; contactName: string; businessName: string }>, topCount: number = 3) {
  console.log(`🚀 Starting PDL enrichment for top ${topCount} leads...`);
  
  const enrichmentPromises = leads.slice(0, topCount).map(async (lead, index) => {
    console.log(`📞 Enriching lead ${index + 1}/${topCount}: ${lead.businessName} (${lead.email})`);
    const enrichment = await enrichPersonWithPDL(lead.email);
    return {
      ...lead,
      enrichment,
    };
  });

  const enrichedLeads = await Promise.all(enrichmentPromises);
  
  console.log(`🏁 PDL enrichment completed for ${enrichedLeads.length} leads`);
  return enrichedLeads;
}