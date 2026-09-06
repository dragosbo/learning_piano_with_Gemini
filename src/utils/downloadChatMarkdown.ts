/**
 * Helper to download the complete Chat History and Study Guide in Markdown format (.md).
 */
export async function downloadChatHistoryMarkdown(): Promise<void> {
  try {
    // Attempt fetching from public directory
    const response = await fetch('/CHAT_HISTORY.md');
    if (response.ok) {
      const markdownText = await response.text();
      triggerBlobDownload(markdownText, 'Nuvole_Bianche_Chat_History_and_Guide.md');
      return;
    }
  } catch {
    // Fallback directly to embedded content
  }

  // Fallback direct blob download
  const fallbackMarkdown = `# Nuvole Bianche Piano Masterclass — Chat History & Study Guide
**Composer:** Ludovico Einaudi  
**Arrangement / Style:** Jacob's Piano Pedagogical Edition  
**Key:** F minor (4 flats: B♭, E♭, A♭, D♭)  
**Meter:** 12/8 time (Andante con moto, ♩. = 48–54 BPM)  
**Chord Progression:** F minor → D♭ major → A♭ major → E♭ major (i – VI – III – VII)  

---

## 1. Questions & Answers Summary
- **App Creation**: Full interactive 88-key piano simulator, audio synth, and 20-measure Jacob's Piano style pedagogical score.
- **Print & PDF Fix**: Solved iframe security sandbox restrictions using jsPDF and direct vector staves.
- **Running Locally**: Node.js v18+, \`npm install\`, and \`npm run dev\`.
- **Google Account**: Project auto-saved in Google AI Studio, share link, and GitHub export.

Please inspect CHAT_HISTORY.md in the project root for the complete unabridged transcript.
`;

  triggerBlobDownload(fallbackMarkdown, 'Nuvole_Bianche_Chat_History_and_Guide.md');
}

function triggerBlobDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
