import { useState, useEffect, useRef } from "react";
import getFileExtension from "@/util/getFileExtension";
import options from "@/util/options.json" with { type: "json" };

export default function FormatSelector({
  file,
  targetFormat,
  setTargetFormat,
}) {
  const [dropboxVisible, setDropboxVisible] = useState(false);
  const [dropList, setDropList] = useState([]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setDropList([]);
      setTargetFormat("");
      return;
    }

    const ext = getFileExtension(file.name).toLowerCase();

    const type = Object.keys(options).find((key) =>
      options[key].includes(ext)
    );

    if (!type) {
      setDropList([]);
      setTargetFormat("");
      return;
    }

    let formats = [...options[type]];

    // video -> audio allowed
    if (type === "video") {
      formats = [...formats, ...options.audio];
    }

    formats = formats.filter((item) => item !== ext);

    formats = [...new Set(formats)];

    formats.sort();

    setDropList(formats);

    setTargetFormat(null);

  }, [file]);

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropboxVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="flex items-center justify-center relative"
    >
      <span className="mr-2">Convert To:</span>

      <button
        type="button"
        onClick={()=>setDropboxVisible((prev)=>!prev)}
        className="px-3 py-1 min-w-28 flex justify-between items-center bg-white rounded border-2 border-neutral-200 hover:border-neutral-400"
      >
        <span className="truncate">{targetFormat || "Select"}</span>
        <span className={`text-xs transition-transform ${dropboxVisible ? "rotate-180" : ""}`}>▼</span>
      </button>

      {dropboxVisible && (
        <div className="absolute top-10 left-20 w-52 max-h-60 overflow-y-auto grid grid-cols-3 gap-2 bg-white px-3 py-2 border-2 border-neutral-300 rounded shadow-lg z-10">
          {dropList.map((item) => (
            <button
              key={item}
              type="button"
              className="w-full px-2 py-1 rounded hover:bg-neutral-100 text-sm"
              onClick={() => {
                setTargetFormat(item);
                setDropboxVisible(false);
              }}
            >
              {item}
            </button>
          ))}

          {dropList.length === 0 && (
            <p className="col-span-3 text-center text-sm text-neutral-500">
              No formats
            </p>
          )}
        </div>
      )}
    </div>
  );
}