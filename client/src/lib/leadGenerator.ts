import { TenantLead, LeadFormData } from "@shared/schema";

const mockBusinessData: Omit<TenantLead, 'id'>[] = [
  {
    name: "BrightCo Marketing",
    industry: "Digital Marketing Agency",
    reasoning: "Growing marketing firm needs professional office space with good visibility for client meetings and team collaboration.",
    contact: "sarah.johnson@brightco.com"
  },
  {
    name: "Artisan Coffee Roasters",
    industry: "Coffee Shop & Roastery",
    reasoning: "Established coffee roaster looking to expand retail presence with high foot traffic and storage for inventory.",
    contact: "mike.wilson@artisancoffee.com"
  },
  {
    name: "TechStart Solutions",
    industry: "Software Development",
    reasoning: "Fast-growing tech startup requiring modern office space with parking for remote team meetups and client presentations.",
    contact: "alex.chen@techstart.io"
  },
  {
    name: "Urban Fitness Studio",
    industry: "Health & Wellness",
    reasoning: "Boutique fitness brand seeking ground-floor space with parking and high visibility for walk-in customers.",
    contact: "jenny.martinez@urbanfitness.com"
  },
  {
    name: "Gourmet Provisions",
    industry: "Specialty Food Store",
    reasoning: "Premium food retailer needs accessible location with loading dock for deliveries and retail visibility.",
    contact: "david.brown@gourmetprovisions.com"
  },
  {
    name: "Creative Design Co",
    industry: "Graphic Design Studio",
    reasoning: "Design agency looking for inspiring workspace with natural light and space for creative team collaboration.",
    contact: "lisa.thompson@creativedesign.co"
  },
  {
    name: "Metro Legal Services",
    industry: "Law Firm",
    reasoning: "Growing legal practice needs professional office space with parking and private meeting areas for client consultations.",
    contact: "robert.davis@metrolegal.com"
  },
  {
    name: "Fresh Market Co",
    industry: "Organic Grocery",
    reasoning: "Organic food retailer seeking storefront with loading dock access and visibility for health-conscious customers.",
    contact: "maria.garcia@freshmarket.co"
  },
  {
    name: "Innovation Labs",
    industry: "Research & Development",
    reasoning: "R&D company requires flexible office space with room for equipment and collaborative work areas.",
    contact: "james.kim@innovationlabs.com"
  },
  {
    name: "Boutique Wellness",
    industry: "Medical Spa",
    reasoning: "Wellness center needs accessible location with parking and professional atmosphere for client treatments.",
    contact: "patricia.white@boutiquewellness.com"
  }
];

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
