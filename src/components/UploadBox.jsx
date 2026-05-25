export default function UploadBox({ inputRef, handleFileInput }) {
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="w-[50dvw] h-[20dvw] bg-neutral-50 rounded-3xl border border-dashed border-neutral-300 cursor-pointer 
      hover:bg-neutral-100 transition-colors"
    >
      <input 
        type="file" 
        className="hidden"
        onChange={handleFileInput}
        ref={inputRef}
      />
      <div className="w-full h-full flex flex-col items-center justify-center z-10">
        <div className="w-[8%] aspect-square bg-blue-200 rounded-full flex items-center justify-center">
          <img src="src/assets/icons/upload.png" alt="Upload" className="aspect-square p-3" />
        </div>
        <p className="px-10 pt-3 text-center text-lg font-[Open_Sans]">Click to Upload a File</p>
        <p className="px-10 text-gray-600 text-center text-xs font-[Open_Sans]">Supports images, documents, audio, and video files</p>
      </div>
    </div>
  );
};
