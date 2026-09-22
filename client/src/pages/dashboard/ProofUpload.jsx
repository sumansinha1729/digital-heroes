import { useState, useRef } from "react";
import { Button } from "../../components/ui/Button.jsx";
import { submitProof } from "../../api/winners.js";

export function ProofUpload({ winnerId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  function handleFile(selectedFile) {
    if (!selectedFile) return;
    setError("");
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleConfirm() {
    setError("");
    setIsUploading(true);
    try {
      await submitProof(winnerId, file);
      onUploaded();
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
  }

  if (previewUrl) {
    return (
      <div className="mt-3 rounded-xl border border-border-light p-3">
        <img src={previewUrl} alt="Proof preview" className="max-h-48 w-full rounded-lg object-contain" />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Button variant="primary" disabled={isUploading} onClick={handleConfirm} className="px-3 py-1.5 text-sm">
            {isUploading ? "Uploading…" : "Confirm upload"}
          </Button>
          <Button variant="secondary" onClick={reset} className="px-3 py-1.5 text-sm">
            Choose a different file
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`mt-3 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center text-sm transition-colors ${
        isDragging ? "border-accent-action bg-accent-action/5" : "border-border-light text-text-muted"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      Drag a screenshot here, or click to choose a file
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
