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
