import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell
      eyebrow="Smart parking prototype"
      title="Park once. Find your car later."
      subtitle="ParkIn remembers your parking spot so you do not have to. This hackathon demo uses simulated mall data and a local memory layer that can be swapped for Vectorize Hindsight."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/malls"
          className="rounded-[28px] bg-accent px-6 py-8 text-[#062018] transition hover:brightness-110"
        >
          <p className="text-sm font-semibold uppercase tracking-wide">Start here</p>
          <h2 className="mt-2 text-3xl font-semibold">Park now</h2>
          <p className="mt-3 text-sm opacity-80">Choose Inorbit Mall, pick an open spot, and save it.</p>
        </Link>
        <Link
          href="/find"
          className="rounded-[28px] border border-line bg-card px-6 py-8 transition hover:border-accent/40"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-2">Coming back?</p>
          <h2 className="mt-2 text-3xl font-semibold">Find my car</h2>
          <p className="mt-3 text-sm text-muted">Retrieve the last parking location ParkIn remembered.</p>
        </Link>
      </div>

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { step: "01", title: "Select a mall", body: "Open Inorbit Mall for the live demo path." },
          { step: "02", title: "Park here", body: "Tap an available spot such as P03, then save it." },
          { step: "03", title: "Find my car", body: "ParkIn returns the remembered level and section." },
        ].map((item) => (
          <li key={item.step} className="rounded-3xl border border-line bg-card p-5">
            <p className="text-xs font-semibold text-accent">{item.step}</p>
            <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
