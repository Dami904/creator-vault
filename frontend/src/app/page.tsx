import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-50">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-8">
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight">
            The escrow platform for{" "}
            <span className="text-brand-500">creator-brand deals</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI-verified milestones, on-chain reputation scores, and USDC escrow
            on Morph L2. No more payment disputes.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mt-4">
          <Link
            href="/auth/signup?type=creator"
            className="group flex flex-col gap-3 p-8 rounded-2xl border border-gray-800 bg-gray-900 hover:border-brand-500 hover:bg-gray-800 transition-all duration-200"
          >
            <span className="text-3xl">🎨</span>
            <h2 className="text-xl font-semibold">I&apos;m a Creator</h2>
            <p className="text-sm text-gray-400">
              Browse brand deals, apply, deliver milestones, and get paid
              automatically.
            </p>
          </Link>

          <Link
            href="/auth/signup?type=organization"
            className="group flex flex-col gap-3 p-8 rounded-2xl border border-gray-800 bg-gray-900 hover:border-brand-500 hover:bg-gray-800 transition-all duration-200"
          >
            <span className="text-3xl">🏢</span>
            <h2 className="text-xl font-semibold">I&apos;m a Brand</h2>
            <p className="text-sm text-gray-400">
              Post content deals, lock funds in escrow, and release payments
              after AI verification.
            </p>
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {[
            {
              icon: "🤖",
              title: "AI Verification",
              body: "Every deliverable is automatically reviewed by our AI verifier before funds release.",
            },
            {
              icon: "🔒",
              title: "Milestone Escrow",
              body: "Funds are locked per milestone on-chain — neither party can rug the other.",
            },
            {
              icon: "⭐",
              title: "On-Chain Reputation",
              body: "Earn a transparent reputation score that follows your wallet across deals.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3">
              <span className="text-4xl">{f.icon}</span>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
