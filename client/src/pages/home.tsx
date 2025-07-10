import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Search, Copy, Download, Mail, Loader2, Check } from "lucide-react";
import { LeadFormData, TenantLead, leadFormSchema, propertyFeatures } from "@shared/schema";
import { generateLeads } from "@/lib/leadGenerator";
import { exportToCSV, copyAllLeads, copyContact } from "@/lib/csvExport";

export default function Home() {
  const [leads, setLeads] = useState<TenantLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copyAllStatus, setCopyAllStatus] = useState<'idle' | 'success'>('idle');
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
      const generatedLeads = await generateLeads(data);
      setLeads(generatedLeads);
    } catch (error) {
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
                
                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    className="bg-primary text-white px-8 py-3 font-medium hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Generate Tenant Leads
                  </Button>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Tenant Suggestions</h2>
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleCopyAll}
                    variant="secondary"
                    className="bg-gray-600 text-white hover:bg-gray-700"
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
                    className="bg-accent text-white hover:bg-green-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download as CSV
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                        {lead.industry}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{lead.reasoning}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="mr-1 h-4 w-4" />
                        <span>{lead.contact}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyContact(lead.contact)}
                        className="text-primary hover:text-blue-700 font-medium text-sm"
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
            <p>&copy; 2024 REVA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
