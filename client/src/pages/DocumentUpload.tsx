import { useRef, useState } from "react";
import type { AssessmentSession, Lang } from "../../../shared/types";
import { api } from "../api";
import { STRINGS } from "../i18n/strings";

export default function DocumentUpload({ lang, session, onNext, onBack }: { lang: Lang; session: AssessmentSession; onNext: () => void; onBack: () => void }) {
  const s = STRINGS[lang].documents;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ filename: string; evidenceAdded: number; affected: string[] }[]>([]);
  const [documents, setDocuments] = useState(session.documents);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const res = await api.uploadDocument(session.id, file);
        setResults((prev) => [...prev, { filename: file.name, evidenceAdded: res.evidenceAdded, affected: res.affectedCompetencies }]);
        setDocuments(res.session.documents);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{s.heading}</h1>
        <p className="text-slate-500">{s.subtitle}</p>
      </div>

      <div className="card p-8 border-dashed border-2 text-center">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".txt,.md,.pdf,.docx"
          className="hidden"
          id="file-upload"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <label htmlFor="file-upload" className="btn-secondary cursor-pointer inline-flex">
          {uploading ? s.uploading : s.chooseFiles}
        </label>
        <p className="text-xs text-slate-400 mt-2">{s.hint}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {documents.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-slate-800 mb-2">{s.uploadedHeading(documents.length)}</h3>
          <ul className="space-y-2 text-sm">
            {documents.map((d) => {
              const r = results.find((r) => r.filename === d.filename);
              return (
                <li key={d.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span className="text-slate-700">{d.filename}</span>
                  <span className="text-xs text-slate-400">{r ? s.touched(r.evidenceAdded) : s.processed}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          {s.back}
        </button>
        <button className="btn-primary px-6" onClick={onNext}>
          {s.skipOrContinue(documents.length > 0)}
        </button>
      </div>
    </div>
  );
}
