"use client";

import { useParams } from "next/navigation";

import { api, type ArtifactDetail } from "@/api";
import { useQuery } from "@/api/use-query";
import { Page } from "@/components/ds/page";
import { ErrorState } from "@/components/ds/states";
import { useWorkspace } from "@/components/shell/workspace-context";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n";

import { ArtifactFrame } from "./parts";
import { FinanceView } from "./views/finance";
import { IdeaView } from "./views/idea";
import { LaunchView, LegalView } from "./views/checklists";
import { ProfileView } from "./views/profile";
import { AcceleratorView } from "./views/accelerator";
import { EntryView } from "./views/entry";
import { ExplainerView } from "./views/explainer";
import { GrowthView } from "./views/growth";
import { HiringView } from "./views/hiring";
import { MarketView } from "./views/market";
import { ProposalView } from "./views/proposal";
import { ValidationView } from "./views/validation";

function View({ wsId, artifact }: { wsId: string; artifact: ArtifactDetail }) {
  switch (artifact.kind) {
    case "profile":
      return <ProfileView artifact={artifact} />;
    case "finance":
      return <FinanceView wsId={wsId} artifact={artifact} />;
    case "legal":
      return <LegalView wsId={wsId} artifact={artifact} />;
    case "launch":
      return <LaunchView wsId={wsId} artifact={artifact} />;
    case "idea":
      return <IdeaView wsId={wsId} artifact={artifact} />;
    case "validation":
      return <ValidationView artifact={artifact} />;
    case "market":
      return <MarketView artifact={artifact} />;
    case "entry":
      return <EntryView artifact={artifact} />;
    case "proposal":
      return <ProposalView artifact={artifact} />;
    case "accelerator":
      return <AcceleratorView wsId={wsId} artifact={artifact} />;
    case "explainer":
      return <ExplainerView wsId={wsId} artifact={artifact} />;
    case "hiring":
      return <HiringView artifact={artifact} />;
    case "growth":
      return <GrowthView artifact={artifact} />;
  }
}

export function ArtifactPage() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const params = useParams<{ id: string }>();
  const { data, error, loading } = useQuery(`artifact:${workspace.id}:${params.id}`, () => api.getArtifact(workspace.id, params.id));

  if (error) {
    return (
      <Page>
        <ErrorState title={t("af.notfound.title")} body={t("af.notfound.body")} />
        <ButtonLink href={`/w/${workspace.id}/file`} variant="secondary" className="w-fit">
          {t("file.title")}
        </ButtonLink>
      </Page>
    );
  }
  if (loading || !data) return <Page>{null}</Page>;
  return (
    <ArtifactFrame wsId={workspace.id} artifact={data}>
      <View wsId={workspace.id} artifact={data} />
    </ArtifactFrame>
  );
}
