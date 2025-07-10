import { TenantLead } from "@shared/schema";

export function exportToCSV(leads: TenantLead[]): void {
  const csvContent = [
    ['Business Name', 'Industry', 'Reasoning', 'Contact'],
    ...leads.map(lead => [
      lead.name,
      lead.industry,
      lead.reasoning,
      lead.contact
    ])
  ];
  
  const csvString = csvContent.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reva-leads.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

export function copyAllLeads(leads: TenantLead[]): Promise<void> {
  let leadsText = 'REVA Generated Leads:\n\n';
  leads.forEach((lead, index) => {
    leadsText += `${index + 1}. ${lead.name}\n`;
    leadsText += `   Industry: ${lead.industry}\n`;
    leadsText += `   Reasoning: ${lead.reasoning}\n`;
    leadsText += `   Contact: ${lead.contact}\n\n`;
  });
  
  return navigator.clipboard.writeText(leadsText);
}

export function copyContact(contact: string): Promise<void> {
  return navigator.clipboard.writeText(contact);
}
