import mammoth from "mammoth";
import html2canvas from "html2canvas";
import * as pdfjsLib from "pdfjs-dist";
import * as docx from "docx";
import jsPDF from "jspdf";

import getFileExtension from "./getFileExtension";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default async function convertDocument(inputFile, outputFileName) {
  const inputExt = getFileExtension(inputFile.name).toLowerCase();
  const outputExt = getFileExtension(outputFileName).toLowerCase();

  try {
    const arrayBuffer = await inputFile.arrayBuffer();

    let outputBlob = null;

    if (inputExt === "docx" && outputExt === "pdf") {
      outputBlob = await docxToPdf(arrayBuffer);
    } else if (inputExt === "pdf" && outputExt === "docx") {
      outputBlob = await pdfToDocx(arrayBuffer);
    } else {
      throw new Error(
        `Unsupported conversion: ${inputExt} → ${outputExt}`
      );
    }

    if (!outputBlob) {
      throw new Error("Conversion failed to generate output");
    }

    const objectURL = URL.createObjectURL(outputBlob);

    return {
      blob: outputBlob,
      filename: outputFileName,
      url: objectURL,
    };
  } catch (error) {
    throw new Error(
      `[${inputExt}→${outputExt}] ${error.message}`
    );
  }
}

async function docxToPdf(arrayBuffer) {
  // Convert DOCX to HTML
  const { value: htmlContent } = await mammoth.convertToHtml({
    arrayBuffer,
  });

  // Create hidden container
  const container = document.createElement("div");

  container.style.cssText = `
    position: absolute;
    left: -10000px;
    top: 0;
    width: 8.27in;
    min-height: 11.69in;
    padding: 40px;
    background: white;
    color: #000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
  `;

  container.innerHTML = htmlContent;

  document.body.appendChild(container);

  try {
    // Render HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/png");

    // Create PDF
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      canvas.width,
      canvas.height
    );

    return pdf.output("blob");
  } finally {
    document.body.removeChild(container);
  }
}

async function pdfToDocx(arrayBuffer) {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
  } = docx;

  // Load PDF
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  const paragraphs = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: pageText,
              size: 24,
            }),
          ],
          spacing: {
            after: 200,
          },
        })
      );
    }

    // Add page break except last page
    if (pageNum < pdf.numPages) {
      paragraphs.push(
        new Paragraph({
          pageBreakBefore: true,
        })
      );
    }
  }

  // Create DOCX
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  // Generate DOCX blob
  return await Packer.toBlob(doc);
}