"use client";

/**
 * AddUrlModal — modal to add a single URL manually (page hors GSC).
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx.
 */

import { useState } from "react";
import { Button } from "@/components/Button";
import { ModalShell, FormField, fieldCls } from "./shared";

export function AddUrlModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [volume, setVolume] = useState("");

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 type-h2">Ajouter une URL manuellement</h2>
      <p className="mt-1 type-body-sm">Pour les pages hors GSC (nouvelle page, concurrent, etc.)</p>
      <div className="mt-6 flex flex-col gap-4">
        <FormField label="URL" required>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://exemple.com/ma-page" autoFocus className={fieldCls} />
        </FormField>
        <FormField label="Mot-clé cible" required>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="ex : seo local paris" className={fieldCls} />
        </FormField>
        <FormField label="Volume estimé" hint="optionnel">
          <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="ex : 1 200" className={fieldCls} />
        </FormField>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 type-label text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!url.trim() || !keyword.trim()} onClick={onClose}>Ajouter et Analyser</Button>
      </div>
    </ModalShell>
  );
}
