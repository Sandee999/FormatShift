import convertDocument from "./convertDocument";
import convertMedia from "./convertMedia";
import getFileExtension from "./getFileExtension";

export default async function convert({
  ffmpeg,
  file,
  outputFileName,
}) {
  let result;
  
  if(getFileExtension(file.name) === "pdf" || getFileExtension(file.name) === "docx") {
    result = await convertDocument(file, outputFileName);
  } else {
    result = await convertMedia(ffmpeg, file, outputFileName);
  }

  const a = document.createElement("a");
  a.href = result.url;
  a.download = outputFileName;

  document.body.appendChild(a);
  a.click();
  a.remove();

  // Clean up browser memory
  setTimeout(() => URL.revokeObjectURL(result.url), 100);
}