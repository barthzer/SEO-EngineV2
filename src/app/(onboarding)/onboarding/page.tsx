"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { StepEntry } from "@/components/onboarding/StepEntry";
import { StepVous } from "@/components/onboarding/StepVous";
import { StepWorkspace } from "@/components/onboarding/StepWorkspace";
import { StepMarche } from "@/components/onboarding/StepMarche";
import { StepProjet } from "@/components/onboarding/StepProjet";
import { StepDone } from "@/components/onboarding/StepDone";
import { PreviewPane } from "@/components/onboarding/PreviewPane";

/** Session mock — à remplacer par useSession() ou équivalent */
const SESSION = {
  firstName: "Barthélemy",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data, step, update, next, back } = useOnboardingState();
  /* Validation par step → désactive le CTA si invalide */
  const isStepValid = (() => {
    switch (step) {
      case 0: return data.goals.length >= 1;
      case 1: return !!data.role && !!data.seniority;
      case 2: return data.workspaceName.trim().length >= 2 && !!data.teamSize;
      case 3: return !!data.primaryCountry && !!data.primaryLanguage;
      case 4: return /^[a-z0-9-]+(\.[a-z]{2,})+$/i.test(data.firstProjectDomain.trim());
      case 5: return true;
      default: return false;
    }
  })();

  function handleFinish() {
    update({ completedAt: Date.now() });
    router.push(`/analyse/${encodeURIComponent(data.firstProjectDomain)}`);
  }

  function handleSkipAll() {
    update({ completedAt: Date.now() });
    router.push("/");
  }

  const StepComponent = () => {
    switch (step) {
      case 0: return <StepEntry data={data} update={update} />;
      case 1: return <StepVous data={data} update={update} />;
      case 2: return <StepWorkspace data={data} update={update} />;
      case 3: return <StepMarche data={data} update={update} />;
      case 4: return <StepProjet data={data} update={update} />;
      case 5: return <StepDone data={data} update={update} />;
      default: return null;
    }
  };

  const preview = <PreviewPane data={data} step={step} signedInName={SESSION.firstName} />;

  return (
    <OnboardingShell
      step={step}
      preview={preview}
      onNext={step === 5 ? handleFinish : (isStepValid ? next : null)}
      onBack={step > 0 ? back : null}
      onSkipAll={step < 5 ? handleSkipAll : null}
      nextLabel={step === 5 ? "Accéder au dashboard" : step === 4 ? "Lancer l'analyse" : "Continuer"}
    >
      <StepComponent />
    </OnboardingShell>
  );
}
