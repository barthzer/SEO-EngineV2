"use client";

/**
 * ImportCSVModal — modal for importing URLs from a CSV file or pasted list.
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx.
 */

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/Button";
import { ModalShell } from "./shared";

type ParsedUrl = { url: string; keyword: string | null; volume: number | null };

export function ImportCSVModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"csv" | "paste">("csv");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setError(null);
    if (!/\.csv$/i.test(f.name)) {
      setError("Le fichier doit être au format .csv");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result ?? "");
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const startIdx = /url|page/i.test(lines[0]?.split(",")[0] ?? "") ? 1 : 0;
      const rows = lines.slice(startIdx).map(line => {
        const cells = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        const vol = cells[2] ? Number(cells[2].replace(/\s/g, "")) : null;
        return {
          url: cells[0] ?? "",
          keyword: cells[1] && cells[1].length > 0 ? cells[1] : null,
          volume: vol !== null && Number.isFinite(vol) ? vol : null,
        };
      }).filter(r => r.url.length > 0);
      if (rows.length === 0) {
        setError("Aucune URL valide détectée dans le fichier.");
        setParsed([]);
        return;
      }
      setParsed(rows);
    };
    reader.readAsText(f);
  }

  const pastedCount = pasted.split(/\r?\n/).map(l => l.trim()).filter(Boolean).length;
  const canImport = tab === "csv" ? parsed.length > 0 : pastedCount > 0;

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 type-h2">Importer des URLs</h2>
      <p className="mt-1 type-body-sm">Choisissez votre méthode d'importation</p>

      <div className="mt-5 flex items-center gap-1 rounded-2xl bg-[var(--bg-secondary)] p-1">
        {([["csv", "Importer CSV"], ["paste", "Coller des URLs"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="flex-1 rounded-xl py-1.5 type-label transition-all"
            style={tab === key ? { backgroundColor: "var(--modal-bg)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: "var(--text-muted)" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "csv" && (
        <div className="mt-5 flex flex-col gap-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 transition-colors ${dragging ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]" : "border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"}`}
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-8 w-8 text-[var(--color-success)]" />
                <p className="type-body-strong">{file.name}</p>
                <p className="type-caption">
                  {parsed.length} URL{parsed.length > 1 ? "s" : ""} détectée{parsed.length > 1 ? "s" : ""} · cliquez pour changer
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[var(--text-muted)]" />
                <p className="type-body-strong">Glissez un fichier CSV ou cliquez pour parcourir</p>
                <p className="type-caption">Colonnes : <code className="font-mono type-micro">url</code> · <code className="font-mono type-micro">keyword</code> (optionnel) · <code className="font-mono type-micro">volume</code> (optionnel)</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {error && <p className="type-caption text-[var(--color-danger)]">{error}</p>}

          {parsed.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="type-label">Aperçu ({Math.min(5, parsed.length)} premier{parsed.length > 1 ? "s" : ""} sur {parsed.length})</p>
              <div className="rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                {parsed.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="truncate font-mono type-label text-[var(--text-primary)]">{p.url}</span>
                    {p.keyword && (
                      <span className="ml-3 flex-shrink-0 rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 type-micro">{p.keyword}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "paste" && (
        <div className="mt-5">
          <textarea value={pasted} onChange={(e) => setPasted(e.target.value)}
            placeholder={"https://exemple.com/page-1\nhttps://exemple.com/page-2"}
            className="w-full resize-none rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 font-mono type-body-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)] transition-colors"
            rows={7} autoFocus />
          <p className="mt-1.5 type-micro">Une URL par ligne · {pastedCount} détectée{pastedCount > 1 ? "s" : ""}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 type-label text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!canImport} onClick={onClose}>
          Importer {tab === "csv" && parsed.length > 0 ? `${parsed.length} URL${parsed.length > 1 ? "s" : ""}` : tab === "paste" && pastedCount > 0 ? `${pastedCount} URL${pastedCount > 1 ? "s" : ""}` : ""}
        </Button>
      </div>
    </ModalShell>
  );
}
