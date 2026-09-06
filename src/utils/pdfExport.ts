import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports an HTML container directly to a multi-page high-resolution PDF document.
 * This runs entirely client-side, bypassing browser iframe sandbox print restrictions.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename = 'Nuvole_Bianche_Ludovico_Einaudi_Sheet_Music.pdf',
  onProgress?: (status: string) => void
): Promise<void> {
  onProgress?.('Preparing score layout...');

  // Render high-DPI canvas of the printable element
  const canvas = await html2canvas(element, {
    scale: 2, // 2x for sharp printing quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
  });

  onProgress?.('Generating PDF pages...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
  const margin = 8; // 8mm margin
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  // Calculate rendered height of the canvas at printable width
  const totalImgHeightMm = (canvas.height * printableWidth) / canvas.width;
  const totalPages = Math.ceil(totalImgHeightMm / printableHeight);

  // Each page will slice a vertical portion of the canvas
  const canvasPageHeightPx = (canvas.width * printableHeight) / printableWidth;

  for (let page = 0; page < totalPages; page++) {
    onProgress?.(`Rendering page ${page + 1} of ${totalPages}...`);

    if (page > 0) {
      pdf.addPage();
    }

    // Source coordinates in canvas
    const sy = page * canvasPageHeightPx;
    const sHeight = Math.min(canvasPageHeightPx, canvas.height - sy);

    // Create a temporary page canvas to draw this exact slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.round(sHeight);
    const ctx = pageCanvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        sy,
        canvas.width,
        sHeight,
        0,
        0,
        canvas.width,
        sHeight
      );

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      const renderHeightMm = (sHeight * printableWidth) / canvas.width;

      pdf.addImage(
        pageImgData,
        'JPEG',
        margin,
        margin,
        printableWidth,
        renderHeightMm
      );

      // Add clean page numbering in footer
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Nuvole Bianche — Ludovico Einaudi • Page ${page + 1} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 4,
        { align: 'center' }
      );
    }
  }

  onProgress?.('Downloading PDF file...');
  pdf.save(filename);
}

/**
 * Attempts to trigger browser print dialog, with safe fallback detection.
 */
export function triggerBrowserPrint(): { success: boolean; error?: string } {
  try {
    window.print();
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
