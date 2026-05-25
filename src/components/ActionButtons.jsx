export default function ActionButtons({ handleConvert, isConverting, fileConversionError, handleClearFile }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button 
        onClick={handleConvert}
        disabled={isConverting || fileConversionError}
        className="px-4 py-1 bg-blue-400 text-white font-medium border border-blue-600 rounded-lg disabled:opacity-50 hover:bg-blue-500 transition-colors"
      >
        {isConverting ? "Converting..." : "Convert"}
      </button>
      
      <button 
        onClick={handleClearFile}
        className="px-2 py-1 text-gray-500 hover:text-red-500 font-bold transition-colors"
        title="Remove file"
      >
        X
      </button>
    </div>
  );
};