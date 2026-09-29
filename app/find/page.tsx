import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function FindMyCarPage() {
  return (
    <PageShell
      eyebrow="Find my car"
      title="Forgot where you parked?"
      subtitle="ParkIn will look up the last parking location saved for this demo user."
    >
      <Link
        href="/find/result"
        className="inline-block rounded-[28px] bg-accent px-8 py-6 text-2xl font-semibold text-[#062018] transition hover:brightness-110"
      >
        Find My Car
      </Link>
    </PageShell>
  );
}
