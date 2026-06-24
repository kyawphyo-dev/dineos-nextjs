import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Renders the element with id "receipt-print-area" to a canvas and exports
 * it as a narrow, receipt-sized PDF — isolated from the rest of the page.
 */
export async function downloadReceiptAsPdf(receiptId: string) {
  const node = document.getElementById("receipt-print-area");
  if (!node) {
    console.error("Receipt element not found for download");
    return;
  }

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  // Convert canvas pixel dimensions to a PDF sized to match (in points, 72 dpi)
  const pdfWidth = canvas.width / 2;
  const pdfHeight = canvas.height / 2;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`receipt-${receiptId}.pdf`);
}
