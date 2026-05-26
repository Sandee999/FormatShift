import fileIcon from "@/assets/icons/file.png"

export default function FileInfo({ fileName }) {
  return (
    <div className="flex py-2 gap-3 items-center">
      <img src={fileIcon} alt="file icon" className="w-6 aspect-square" />
      <p className="font-medium line-clamp-1">{fileName}</p>
    </div>
  );
};