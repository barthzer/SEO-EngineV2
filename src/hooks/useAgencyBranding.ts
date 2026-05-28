"use client";

import { useEffect, useState } from "react";
import { type AgencyBranding, DEFAULT_BRANDING, readBranding } from "@/lib/agency-branding";

/**
 * Hook React — réactif aux changements de branding via event "agency-branding:changed".
 * Pendant le rendu SSR, retourne DEFAULT_BRANDING ; côté client, hydrate depuis localStorage.
 */
export function useAgencyBranding(): AgencyBranding {
  const [branding, setBranding] = useState<AgencyBranding>(DEFAULT_BRANDING);

  useEffect(() => {
    // Hydratation initiale côté client
    setBranding(readBranding());

    function onChange() {
      setBranding(readBranding());
    }
    window.addEventListener("agency-branding:changed", onChange);
    // Sync entre onglets via storage event
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("agency-branding:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return branding;
}
