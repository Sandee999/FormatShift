import { fetchFile } from '@ffmpeg/util';
import getFileExtension from './getFileExtension';

function getMimeType(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();

  const mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

export default async function convertMedia(ffmpeg, inputFile, outputFileName) {
  const inputExt = getFileExtension(inputFile.name);

  // safer unique filenames
  const inputFileName = `input.${inputExt}`;

  try {
    // write input file
    await ffmpeg.writeFile(
      inputFileName,
      await fetchFile(inputFile)
    );

    let ffmpeg_cmd = [];

    if (inputExt === '3gp') {
      ffmpeg_cmd = [
        '-i',
        inputFileName,
        '-r',
        '20',
        '-s',
        '352x288',
        '-vb',
        '400k',
        '-acodec',
        'aac',
        '-strict',
        'experimental',
        '-ac',
        '1',
        '-ar',
        '8000',
        '-ab',
        '24k',
        outputFileName,
      ];
    } else {
      ffmpeg_cmd = [
        '-i',
        inputFileName,
        outputFileName,
      ];
    }

    console.log('Running FFmpeg:', ffmpeg_cmd);

    // run ffmpeg
    await ffmpeg.exec(ffmpeg_cmd);

    // verify output exists
    const files = await ffmpeg.listDir('/');

    const outputExists = files.some(
      file => file.name === outputFileName
    );

    if (!outputExists) {
      throw new Error('FFmpeg failed to generate output file');
    }

    // read output
    const fileData = await ffmpeg.readFile(outputFileName);

    const mimeType = getMimeType(outputFileName);

    const outputBlob = new Blob(
      [fileData.buffer],
      { type: mimeType }
    );

    const objectURL = URL.createObjectURL(outputBlob);

    return {
      blob: outputBlob,
      url: objectURL,
    };

  } finally {
    // cleanup safely
    try {
      await ffmpeg.deleteFile(inputFileName);
    } catch {}

    try {
      await ffmpeg.deleteFile(outputFileName);
    } catch {}
  }
}