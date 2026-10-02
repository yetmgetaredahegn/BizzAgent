import { notFound } from "next/navigation";

import { SECTIONS, type Section } from "@/components/settings/sections-list";
import { SettingsScreen } from "@/components/settings/settings-screen";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ section }));
}

export default async function SettingsPage({ params }: PageProps<"/me/settings/[section]">) {
  const { section } = await params;
  if (!SECTIONS.includes(section as Section)) notFound();
  return <SettingsScreen />;
}
