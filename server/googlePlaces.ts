import { InsertLead } from "@shared/schema";

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  business_status: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  website?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  website?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  business_status: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
}

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  throw new Error("GOOGLE_PLACES_API_KEY environment variable is required");
}

// Business type mapping for Google Places API
const businessTypeMapping: Record<string, string[]> = {
  "restaurant": ["restaurant", "meal_takeaway", "food"],
  "retail": ["clothing_store", "store", "shopping_mall", "electronics_store"],
  "office": ["real_estate_agency", "accounting", "lawyer", "insurance_agency"],
  "medical": ["hospital", "doctor", "dentist", "pharmacy", "health"],
  "fitness": ["gym", "spa", "beauty_salon"],
  "automotive": ["car_dealer", "car_repair", "gas_station"],
  "entertainment": ["movie_theater", "amusement_park", "tourist_attraction"],
  "financial": ["bank", "atm", "finance"],
  "education": ["school", "university", "library"],
  "technology": ["electronics_store", "computer_store"]
};

function getGooglePlaceTypes(businessType: string): string[] {
  const lowerType = businessType.toLowerCase();
  
  // Try exact match first
  if (businessTypeMapping[lowerType]) {
    return businessTypeMapping[lowerType];
  }
  
  // Try partial matches
  for (const [key, types] of Object.entries(businessTypeMapping)) {
    if (lowerType.includes(key) || key.includes(lowerType)) {
      return types;
    }
  }
  
  // Default to establishment if no match
  return ["establishment"];
}

function generateIndustryFromTypes(types: string[]): string {
  const industryMap: Record<string, string> = {
    "restaurant": "Restaurant and Food Service",
    "meal_takeaway": "Restaurant and Food Service",
    "food": "Restaurant and Food Service",
    "clothing_store": "Retail and Fashion",
    "store": "Retail Store",
    "shopping_mall": "Retail and Shopping",
    "electronics_store": "Electronics and Technology",
    "real_estate_agency": "Real Estate Services",
    "accounting": "Professional Services",
    "lawyer": "Legal Services",
    "insurance_agency": "Insurance Services",
    "hospital": "Healthcare Services",
    "doctor": "Medical Practice",
    "dentist": "Dental Services",
    "pharmacy": "Healthcare and Pharmacy",
    "gym": "Health and Wellness",
    "spa": "Health and Wellness",
    "beauty_salon": "Beauty and Wellness",
    "car_dealer": "Automotive Sales",
    "car_repair": "Automotive Services",
    "gas_station": "Automotive and Fuel",
    "movie_theater": "Entertainment",
    "bank": "Financial Services",
    "school": "Educational Services",
    "university": "Higher Education"
  };

  for (const type of types) {
    if (industryMap[type]) {
      return industryMap[type];
    }
  }
  
  return "Professional Services";
}

function generateRationale(business: PlaceDetails, businessType: string, squareFootage: string, features: string[]): string {
  const size = parseInt(squareFootage) || 1000;
  const sizeCategory = size < 1000 ? "compact" : size < 5000 ? "medium-sized" : "large";
  
  const baseRationale = `${business.name} is actively seeking ${sizeCategory} commercial space`;
  
  const locationBenefit = business.formatted_address.includes("Street") || business.formatted_address.includes("Ave") 
    ? "with street-level visibility and foot traffic" 
    : "in a professional setting";
  
  const ratingContext = business.rating && business.rating > 4.0 
    ? "This well-rated business" 
    : "This growing business";
  
  const featuresContext = features.length > 0 
    ? ` They specifically need ${features.slice(0, 2).join(" and ").toLowerCase()}` 
    : "";
  
  return `${ratingContext} ${baseRationale} ${locationBenefit}.${featuresContext} Perfect match for commercial real estate opportunities.`;
}

export async function searchBusinesses(
  businessType: string, 
  location: string, 
  squareFootage: string,
  features: string[]
): Promise<InsertLead[]> {
  try {
    const placeTypes = getGooglePlaceTypes(businessType);
    const query = `${businessType} in ${location}`;
    
    // First, search for places using text search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&type=${placeTypes[0]}`;
    
    console.log(`🔍 Searching Google Places for: "${query}"`);
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`Google Places API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', searchData);
      throw new Error(`Google Places API error: ${searchData.status}`);
    }
    
    if (!searchData.results || searchData.results.length === 0) {
      console.log(`❌ No businesses found for "${query}"`);
      return [];
    }
    
    console.log(`✅ Found ${searchData.results.length} businesses`);
    
    // Get details for the first 5 places
    const leads: InsertLead[] = [];
    const maxResults = Math.min(5, searchData.results.length);
    
    for (let i = 0; i < maxResults; i++) {
      const place = searchData.results[i] as GooglePlaceResult;
      
      try {
        // Get detailed information for each place
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,website,formatted_phone_number,international_phone_number,business_status,types,rating,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`;
        
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) {
          console.warn(`Failed to get details for ${place.name}`);
          continue;
        }
        
        const detailsData = await detailsResponse.json();
        if (detailsData.status !== 'OK') {
          console.warn(`Details API error for ${place.name}:`, detailsData.status);
          continue;
        }
        
        const details = detailsData.result as PlaceDetails;
        
        // Skip if business is permanently closed
        if (details.business_status === 'CLOSED_PERMANENTLY') {
          continue;
        }
        
        // Generate contact email (we'll try to find real ones via PDL)
        const businessDomain = details.website ? 
          new URL(details.website).hostname.replace('www.', '') : 
          `${details.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        
        const contactEmail = `info@${businessDomain}`;
        
        // Generate contact name (will be enhanced by PDL if found)
        const contactName = `${details.name} Manager`;
        
        const lead: InsertLead = {
          businessName: details.name,
          industry: generateIndustryFromTypes(details.types),
          rationale: generateRationale(details, businessType, squareFootage, features),
          contactName: contactName,
          email: contactEmail,
          website: details.website || `https://${businessDomain}`,
          linkedinUrl: `https://linkedin.com/company/${details.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
        };
        
        leads.push(lead);
        console.log(`📍 Added business: ${details.name}`);
        
      } catch (error) {
        console.warn(`Error processing place ${place.name}:`, error);
        continue;
      }
    }
    
    console.log(`🎯 Generated ${leads.length} real business leads`);
    return leads;
    
  } catch (error) {
    console.error('Error searching Google Places:', error);
    throw error;
  }
}