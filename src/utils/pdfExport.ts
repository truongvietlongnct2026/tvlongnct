import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture an HTML element and export as high-resolution PDF file
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileName: string = 'KetQua_Thi_Toan12.pdf'
): Promise<void> {
  try {
    // 1. Create high-resolution canvas snapshot
    const canvas = await html2canvas(element, {
      scale: 2, // High DPI for crisp text and graphics
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // 2. Compute A4 page dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate aspect ratio
    const imgWidth = pdfWidth;
    const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

    // If height fits in 1 page, render directly; otherwise split cleanly across pages
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    // 3. Trigger download
    pdf.save(fileName);
  } catch (error) {
    console.error('Lỗi khi xuất file PDF:', error);
    throw error;
  }
}
