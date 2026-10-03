import { ArrowLeft, Compass } from "lucide-react";

import { Logo } from "@/components/site/brand";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center px-4 py-20">
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <Compass className="mx-auto mt-10 size-10 text-brand-500" aria-hidden />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">This page is not in the pack</h1>
        <p className="mt-3 text-muted">
          We would rather say so than guess where you meant to go.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">
            <ArrowLeft className="size-4" aria-hidden /> Back to BizzAgent
          </ButtonLink>
          <ButtonLink href="/review" variant="secondary">Reviewer dashboard</ButtonLink>
        </div>
      </div>
    </main>
  );
}
