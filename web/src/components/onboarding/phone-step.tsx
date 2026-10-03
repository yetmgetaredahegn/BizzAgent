"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useStore } from "@/lib/store";

import { onboardingStore, patchOnboarding } from "./state";

export function PhoneStep() {
  const { t } = useI18n();
  const router = useRouter();
  const state = useStore(onboardingStore);
  const [value, setValue] = useState(state.phone);
  const [error, setError] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const digits = value.replace(/\D/g, "");
    if (digits.length < 9) {
      setError(true);
      return;
    }
    patchOnboarding({ phone: value });
    router.push("/start/path");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(1.75rem,6vw,2.5rem)] leading-tight font-bold">{t("ob.phone.title")}</h1>
        <p className="text-muted">{t("ob.phone.why")}</p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="font-semibold">
          {t("ob.phone.label")}
        </label>
        <div className="rounded-sheet flex items-center gap-2 bg-surface px-3 ring-1 ring-line-strong focus-within:ring-2 focus-within:ring-stamp">
          <span className="num text-lg text-muted">+251</span>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(false);
            }}
            placeholder="9XX XXX XXX"
            aria-invalid={error}
            aria-describedby={error ? "phone-error" : undefined}
            className="num min-h-14 flex-1 bg-transparent text-xl outline-none"
          />
        </div>
        {error && (
          <p id="phone-error" role="alert" className="text-sm text-contradictory">
            {t("ob.phone.invalid")}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full tablet:w-fit">
        {t("action.continue")}
      </Button>
    </form>
  );
}
