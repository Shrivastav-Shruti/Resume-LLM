// Simple utility to clean markdown formatting from text
export function cleanMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // Remove bold **text**
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove italic *text*
    .replace(/\*(.+?)\*/g, '$1')
    // Remove headers ##
    .replace(/^#{1,6}\s+/gm, '')
    // Remove inline code `code`
    .replace(/`(.+?)`/g, '$1')
    // Keep the text clean and readable
    .trim();
}

// Format text for display with proper line breaks
export function formatDisplayText(text: string): string {
  const cleaned = cleanMarkdown(text);
  
  // Ensure proper spacing between sections
  return cleaned
    .replace(/\n{3,}/g, '\n\n') // Max 2 line breaks
    .trim();
}
