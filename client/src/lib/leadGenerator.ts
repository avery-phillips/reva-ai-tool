import { TenantLead, LeadFormData, InsertLead } from "@shared/schema";

// Extended mock data for database insertion with real emails for PDL testing
const mockBusinessDataForDB = [
  {
    businessName: "BrightCo Marketing",
    industry: "Digital Marketing Agency",
    rationale: "Growing marketing firm needs professional office space with good visibility for client meetings and team collaboration.",
    contactName: "Sarah Johnson",
    email: "sarah.martinez@gmail.com", // Common email pattern more likely in PDL
    website: "https://brightcomarketing.com",
    linkedinUrl: "https://linkedin.com/company/brightco-marketing"
  },
  {
    businessName: "Artisan Coffee Roasters",
    industry: "Coffee Shop & Roastery",
    rationale: "Established coffee roaster looking to expand retail presence with high foot traffic and storage for inventory.",
    contactName: "Mike Wilson",
    email: "mike.johnson@gmail.com", // Common email pattern more likely in PDL
    website: "https://artisancoffeeroasters.com",
    linkedinUrl: "https://linkedin.com/company/artisan-coffee-roasters"
  },
  {
    businessName: "TechStart Solutions",
    industry: "Software Development",
    rationale: "Fast-growing tech startup requiring modern office space with parking for remote team meetups and client presentations.",
    contactName: "Alex Chen",
    email: "alex.smith@gmail.com", // Common email pattern more likely in PDL
    website: "https://techstartsolutions.io",
    linkedinUrl: "https://linkedin.com/company/techstart-solutions"
  },
  {
    businessName: "Urban Fitness Studio",
    industry: "Health & Wellness",
    rationale: "Boutique fitness brand seeking ground-floor space with parking and high visibility for walk-in customers.",
    contactName: "Jenny Martinez",
    email: "jenny.martinez@urbanfitness.com",
    website: "https://urbanfitnessstudio.com",
    linkedinUrl: "https://linkedin.com/company/urban-fitness-studio"
  },
  {
    businessName: "Gourmet Provisions",
    industry: "Specialty Food Store",
    rationale: "Premium food retailer needs accessible location with loading dock for deliveries and retail visibility.",
    contactName: "David Brown",
    email: "david.brown@gourmetprovisions.com",
    website: "https://gourmetprovisions.com",
    linkedinUrl: "https://linkedin.com/company/gourmet-provisions"
  },
  {
    businessName: "Creative Design Co",
    industry: "Graphic Design Studio",
    rationale: "Design agency looking for inspiring workspace with natural light and space for creative team collaboration.",
    contactName: "Lisa Thompson",
    email: "lisa.thompson@creativedesign.co",
    website: "https://creativedesignco.com",
    linkedinUrl: "https://linkedin.com/company/creative-design-co"
  },
  {
    businessName: "Metro Legal Services",
    industry: "Law Firm",
    rationale: "Growing legal practice needs professional office space with parking and private meeting areas for client consultations.",
    contactName: "Robert Davis",
    email: "robert.davis@metrolegal.com",
    website: "https://metrolegalservices.com",
    linkedinUrl: "https://linkedin.com/company/metro-legal-services"
  },
  {
    businessName: "Fresh Market Co",
    industry: "Organic Grocery",
    rationale: "Organic food retailer seeking storefront with loading dock access and visibility for health-conscious customers.",
    contactName: "Maria Garcia",
    email: "maria.garcia@freshmarket.co",
    website: "https://freshmarketco.com",
    linkedinUrl: "https://linkedin.com/company/fresh-market-co"
  },
  {
    businessName: "Innovation Labs",
    industry: "Research & Development",
    rationale: "R&D company requires flexible office space with room for equipment and collaborative work areas.",
    contactName: "James Kim",
    email: "james.kim@innovationlabs.com",
    website: "https://innovationlabs.com",
    linkedinUrl: "https://linkedin.com/company/innovation-labs"
  },
  {
    businessName: "Boutique Wellness",
    industry: "Medical Spa",
    rationale: "Wellness center needs accessible location with parking and professional atmosphere for client treatments.",
    contactName: "Patricia White",
    email: "patricia.white@boutiquewellness.com",
    website: "https://boutiquewellness.com",
    linkedinUrl: "https://linkedin.com/company/boutique-wellness"
  }
];

// Legacy mock data for frontend display (mapped from database format)
const mockBusinessData: Omit<TenantLead, 'id'>[] = mockBusinessDataForDB.map(lead => ({
  name: lead.businessName,
  industry: lead.industry,
  reasoning: lead.rationale,
  contact: lead.email
}));

export function generateLeads(formData: LeadFormData): Promise<TenantLead[]> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Shuffle and select random results
      const shuffled = mockBusinessData.sort(() => 0.5 - Math.random());
      const resultCount = Math.floor(Math.random() * 6) + 5; // 5-10 results
      const selectedResults = shuffled.slice(0, resultCount);
      
      // Add unique IDs
      const results: TenantLead[] = selectedResults.map((result, index) => ({
        ...result,
        id: `lead-${Date.now()}-${index}`
      }));
      
      resolve(results);
    }, 1500);
  });
}

export function generateLeadsForDatabase(formData: LeadFormData): Promise<InsertLead[]> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Shuffle and select random results
      const shuffled = mockBusinessDataForDB.sort(() => 0.5 - Math.random());
      const resultCount = Math.floor(Math.random() * 6) + 5; // 5-10 results
      const selectedResults = shuffled.slice(0, resultCount);
      
      resolve(selectedResults);
    }, 100); // Shorter delay since this is for internal use
  });
}
