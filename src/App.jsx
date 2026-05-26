import { useState, useEffect, useRef } from 'react';
import GithubLogo from "@/assets/icons/github.png"
import loadFfmpeg from '@/util/loadFfmpeg';
import convert from '@/util/convert';
import UploadBox from '@/components/UploadBox';
import FileInfo from '@/components/FileInfo';
import FormatSelector from '@/components/FormatSelector';
import ActionButtons from '@/components/ActionButtons';

const appName = "FormatShift";

function App() {
  const [isReady, setIsReady] = useState(false);
  const inputRef = useRef();
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [fileConversionError, setFileConversionError] = useState(false)
  
  const ffmpegRef = useRef(null);

  useEffect(()=>{
    const handleInit = async() =>{
      try {
        const ffmpeg = await loadFfmpeg();
        ffmpeg.on('log', ({ message }) => console.log('[FFmpeg Log]:', message));
        ffmpegRef.current = ffmpeg;
        setIsReady(true);
      } catch (error) {
        console.error("Failed to load FFmpeg:", error);
        alert("Could not initialize the media engine.");
      }
    }
    handleInit();
  },[])

  const handleFileInput = (e) => {
    const fileInput = e.target.files[0];
    
    if(!fileInput){
      setFile(null);
      window.alert("Couldn't receive the file.");
      return;
    }

    setFile(fileInput);
  }

  const handleClearFile = () => {
    setFile(null);
    setFileConversionError(false);
  }

  const handleConvert = async() =>{
    if(!file || !ffmpegRef.current || !targetFormat) {
      if (!targetFormat) alert("Please select a target format first.");
      return;
    }

    if(fileConversionError) return;
    
    setIsConverting(true);

    try {
      const outputFileName = `${(file.name).replace(/\.[^/.]+$/, "") || 'converted_file'}.${targetFormat}`;
      await convert({
        ffmpeg: ffmpegRef.current,
        file,
        outputFileName,
      });
    } catch(e) {
      console.error(e);
      setFileConversionError(true)
    } finally {
      setIsConverting(false);
    }
  }

  if(!isReady) return (
    <div className="w-screen h-screen flex items-center justify-center">
      <svg className="text-gray-300 animate-spin scale-150" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
        width="24" height="24">
        <path
          d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
          stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path
          d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
          stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
        </path>
      </svg>
    </div>
  );

  return (
    <div className="w-screen min-h-screen flex flex-col">
      <div className="w-full h-20 px-15 flex items-center justify-between">
        <h1 className="h-full flex items-center text-3xl font-[Playfair_Display]">{appName}</h1>
        <div className="h-full hidden sm:flex grow-0 flex-row-reverse">
          <a 
            href='https://github.com/Sandee999/'
            target='_blank'
            className="h-full aspect-square flex items-center justify-center hover:underline"
          >
            <img src={GithubLogo} className="h-[50%] aspect-square" />
            <p className="px-1 font-[Playfair_Display]">Github</p>
          </a>
        </div>
      </div>
      <section className="px-40 py-10 hidden md:flex flex-col items-center justify-center ">
        <h3 className="pb-5 flex items-center justify-center text-3xl font-[Open_Sans]">Why trust external servers with your private files?</h3>
        <p className="text-lg font-[Open_Sans]">
          <span className="font-[Playfair_Display]">{appName}</span> is your go-to online tool for unlimited, free multimedia conversion. 
          Because everything is processed locally on your device, you get maximum speed and absolute privacy. 
          Easily convert images, audio, and videos without size restrictions. Drop a file to streamline your content effortlessly with {appName}!
        </p>
      </section>
      <section className="w-full h-full p-10 flex items-center justify-center">
        {(!file)?
          <UploadBox inputRef={inputRef} handleFileInput={handleFileInput} />
          :
          <div className="w-[80%] px-8 py-5 flex items-center justify-center md:justify-between flex-wrap bg-neutral-50 rounded-3xl border border-dashed border-neutral-300">
            <FileInfo fileName={file.name} />
            <div className="flex flex-wrap justify-center py-2 gap-5">
              {(!fileConversionError)?
                <FormatSelector file={file} targetFormat={targetFormat} setTargetFormat={setTargetFormat} />
                :
                <p className='px-4 py-2 bg-red-500 text-sm text-white rounded-xl'>File cannot be converted</p>
              }
              <ActionButtons handleConvert={handleConvert} isConverting={isConverting} handleClearFile={handleClearFile} />
            </div>
          </div>
        }
      </section>
    </div>
  );
}

export default App;