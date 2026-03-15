import puppeteer from "puppeteer";

export async function generatePDF(html: string) {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setContent(html);

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdf;
}

//---------------------------------------------------------------

/* PRINT FUNCTION 👇*/

/**
 * printFormat
 * Wraps the content of a DOM element in a print-only window
 * and triggers the browser print dialog.
 *
 * Usage:
 *   printFormat("print-area")
 */
export function printFormat(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=650");
  if (!printWindow) {
    console.error("Could not open print window. Check popup blocker settings.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 0;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Small delay to ensure content is fully loaded before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
}
