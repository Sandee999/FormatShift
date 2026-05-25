export default function getFileExtension(fileName) {
  return fileName.split('.').pop().toLowerCase();
}