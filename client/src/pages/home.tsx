import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Search, Copy, Download, Mail, Loader2, Check, Phone, User, Briefcase, Linkedin, Building2, Globe } from "lucide-react";
import { LeadFormData, TenantLead, Lead, leadFormSchema, propertyFeatures } from "@shared/schema";
import { generateLeads, generateLeadsForDatabase } from "@/lib/leadGenerator";
import { exportToCSV, copyAllLeads, copyContact } from "@/lib/csvExport";

export default function Home() {
  const [leads, setLeads] = useState<TenantLead[]>([]);
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [showSavedLeads, setShowSavedLeads] = useState(false);
  const [copyAllStatus, setCopyAllStatus] = useState<'idle' | 'success'>('idle');
  const [filters, setFilters] = useState({
    industry: '',
    contactName: '',
    keywords: ''
  });
  const { toast } = useToast();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      businessType: "",
      targetLocation: "",
      squareFootage: "",
      features: [],
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsLoading(true);
    try {
      // Generate leads for display
      const generatedLeads = await generateLeads(data);
      setLeads(generatedLeads);

      // Generate leads for database insertion (with extended fields)
      const leadsForDB = await generateLeadsForDatabase(data);
      
      // Save leads to database
      const response = await fetch("/api/leads", {
        method: "POST",
        body: JSON.stringify(leadsForDB),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save leads: ${response.statusText}`);
      }
      
      console.log(`Successfully saved ${leadsForDB.length} leads to database`);
      
    } catch (error) {
      console.error("Error generating or saving leads:", error);
      toast({
        title: "Error",
        description: "Failed to generate leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = async () => {
    try {
      await copyAllLeads(leads);
      setCopyAllStatus('success');
      toast({
        title: "Success",
        description: "All leads copied to clipboard!",
      });
      setTimeout(() => setCopyAllStatus('idle'), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy leads to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyContact = async (contact: string) => {
    try {
      await copyContact(contact);
      toast({
        title: "Contact Copied",
        description: `${contact} copied to clipboard!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy contact to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCSV = () => {
    try {
      exportToCSV(leads);
      toast({
        title: "Download Started",
        description: "CSV file download has started.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download CSV file.",
        variant: "destructive",
      });
    }
  };

  const fetchSavedLeads = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await fetch("/api/leads");
      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }
      const leads = await response.json();
      setSavedLeads(leads);
      setFilteredLeads(leads);
      setShowSavedLeads(true);
      toast({
        title: "Success",
        description: `Loaded ${leads.length} saved leads from database.`,
      });
    } catch (error) {
      console.error("Error fetching saved leads:", error);
      toast({
        title: "Error",
        description: "Failed to load saved leads from database.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const applyFilters = () => {
    let filtered = savedLeads;

    if (filters.industry) {
      filtered = filtered.filter(lead => 
        lead.industry.toLowerCase().includes(filters.industry.toLowerCase())
      );
    }

    if (filters.contactName) {
      filtered = filtered.filter(lead => 
        lead.contactName.toLowerCase().includes(filters.contactName.toLowerCase())
      );
    }

    if (filters.keywords) {
      filtered = filtered.filter(lead => 
        lead.rationale.toLowerCase().includes(filters.keywords.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      contactName: '',
      keywords: ''
    });
    setFilteredLeads(savedLeads);
  };

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters, savedLeads]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary">REVA</div>
              <div className="ml-2 text-sm text-secondary">Real Estate Virtual Assistant</div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-secondary hover:text-primary transition-colors">Features</a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">Pricing</a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">REVA</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">AI-powered tenant matchmaker for commercial spaces</p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Instant Matching</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Qualified Leads</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Export Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Lead Generation Form */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Find Your Perfect Commercial Tenants</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <Phone className="h-4 w-4" />
                <span className="font-medium">Enhanced Lead Enrichment</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Top 3 generated leads are automatically enriched with phone numbers and LinkedIn profiles using People Data Labs API.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Restaurant, Retail Store, Office" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="targetLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Downtown Seattle, Miami Beach" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="squareFootage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Square Footage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1500, 2000-3000, 5000+" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="features"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base">Property Features</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {propertyFeatures.map((feature) => (
                          <FormField
                            key={feature}
                            control={form.control}
                            name="features"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={feature}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(feature)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, feature])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== feature
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {feature}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Button 
                    type="submit" 
                    className="bg-primary text-white px-8 py-3 font-medium hover:bg-blue-700 w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Generate Tenant Leads
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    Clear Form
                  </Button>
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={fetchSavedLeads}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={isLoadingSaved}
                  >
                    {isLoadingSaved ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    View Saved Leads
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  REVA uses AI to simulate potential tenants based on your input. Results are sample suggestions — API enrichment coming soon.
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="inline-block h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-gray-600">Generating your tenant matches...</p>
          </div>
        )}

        {/* Results Section */}
        {leads.length > 0 && !isLoading && (
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-900">🎯 Suggested Tenants for Your Property</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <Button 
                    onClick={handleCopyAll}
                    variant="secondary"
                    className="bg-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto"
                  >
                    {copyAllStatus === 'success' ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copyAllStatus === 'success' ? 'Copied!' : 'Copy All Leads'}
                  </Button>
                  <Button 
                    onClick={handleDownloadCSV}
                    className="bg-accent text-white hover:bg-green-600 w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download as CSV
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{lead.name}</h3>
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm whitespace-nowrap">
                        {lead.industry}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{lead.reasoning}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="mr-1 h-4 w-4 flex-shrink-0" />
                        <span className="break-all">{lead.contact}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyContact(lead.contact)}
                        className="text-primary hover:text-blue-700 font-medium text-sm whitespace-nowrap"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder Message */}
        {leads.length === 0 && !isLoading && !showSavedLeads && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Find Your Perfect Tenants?</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your tenant matches will appear here after you click "Generate Tenant Leads". 
                  Fill out the form above to get started with AI-powered tenant suggestions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Leads Section */}
        {showSavedLeads && (
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-900">💾 Saved Leads from Database</h2>
                <Button 
                  onClick={() => setShowSavedLeads(false)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Hide Saved Leads
                </Button>
              </div>

              {/* Filter Section */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Leads</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <Input
                      placeholder="e.g., Marketing, Coffee, Legal"
                      value={filters.industry}
                      onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <Input
                      placeholder="e.g., Sarah, Mike, Alex"
                      value={filters.contactName}
                      onChange={(e) => setFilters(prev => ({ ...prev, contactName: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keywords in Rationale</label>
                    <Input
                      placeholder="e.g., office, parking, visibility"
                      value={filters.keywords}
                      onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {filteredLeads.length} of {savedLeads.length} leads
                  </div>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    disabled={!filters.industry && !filters.contactName && !filters.keywords}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              {isLoadingSaved ? (
                <div className="text-center py-8">
                  <Loader2 className="inline-block h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-gray-600">Loading saved leads...</p>
                </div>
              ) : savedLeads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No saved leads found in database.</p>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No leads match your current filters. Try adjusting the criteria above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredLeads.map((lead) => (
                    <div key={lead.id} className={`rounded-lg p-6 hover:shadow-md transition-shadow ${lead.isEnriched ? 'bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{lead.businessName}</h3>
                          {lead.isEnriched && (
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              ✨ Enhanced
                            </span>
                          )}
                        </div>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm whitespace-nowrap">
                          {lead.industry}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{lead.rationale}</p>
                      
                      {/* Contact Information - Prioritize phone for enriched leads */}
                      <div className="space-y-2 mb-4">
                        {/* Display enriched name with title if available */}
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-700">
                              {lead.enrichedName || lead.contactName}
                              {lead.title && (
                                <span className="text-gray-500 ml-1">
                                  • {lead.title}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Phone number (priority for enriched leads) */}
                        {lead.phone && (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-700">Phone:</span>
                              <span className="text-gray-600">{lead.phone}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyContact(lead.phone)}
                                className="p-1 h-6 w-6"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Email */}
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-gray-600">{lead.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyContact(lead.email)}
                              className="p-1 h-6 w-6"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Website */}
                        {lead.website && (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-gray-700">Website:</span>
                              <a 
                                href={lead.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary hover:underline"
                              >
                                {lead.website.replace(/https?:\/\//, '')}
                              </a>
                            </div>
                          </div>
                        )}

                        {/* LinkedIn */}
                        {lead.linkedinUrl && (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4 text-blue-700" />
                              <span className="font-medium text-gray-700">LinkedIn:</span>
                              <a 
                                href={lead.linkedinUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-700 hover:underline"
                              >
                                View Profile
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="text-xs text-gray-400">
                          Saved: {new Date(lead.createdAt).toLocaleDateString()}
                          {lead.isEnriched && (
                            <span className="ml-2 text-blue-500 font-medium">• Enhanced with PDL</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyContact(lead.phone || lead.email)}
                          className="text-primary hover:text-blue-700 font-medium text-sm whitespace-nowrap"
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Copy {lead.phone ? 'Phone' : 'Email'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">REVA</h3>
              <p className="text-gray-300">AI-powered tenant matchmaker for commercial spaces</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="text-gray-300 space-y-2">
                <li>Instant Lead Generation</li>
                <li>AI-Powered Matching</li>
                <li>Export & Download</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">support@reva.ai</p>
              <p className="text-gray-300">1-800-REVA-AI</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 REVA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
