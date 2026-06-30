import Link from "next/link"
import { Shield, Star, Headphones, CreditCard, ArrowRight, Users, Package, Globe } from "lucide-react"

export default function AboutPage() {
  const team = [
    { name: "Mr. CEO", role: "Founder & CEO", initial: "N" },
    { name: "Travel Expert", role: "Head of Curation", initial: "T" },
    { name: "Support Lead", role: "Customer Success", initial: "S" },
  ]

  const values = [
    {
      icon: <Shield className="w-5 h-5 text-[var(--accent)]" />,
      title: "Trust & Safety",
      desc: "Every provider is manually verified. We run background checks and review documentation before anyone can list a package on Travely.",
    },
    {
      icon: <Star className="w-5 h-5 text-[var(--accent)]" />,
      title: "Quality First",
      desc: "We curate only the best travel experiences. Our team personally vets packages for quality, accuracy, and value for money.",
    },
    {
      icon: <Headphones className="w-5 h-5 text-[var(--accent)]" />,
      title: "Always Here",
      desc: "Travel plans change. Our support team is available around the clock to help you before, during, and after your trip.",
    },
    {
      icon: <CreditCard className="w-5 h-5 text-[var(--accent)]" />,
      title: "Transparent Pricing",
      desc: "No hidden fees. What you see is what you pay. We show you exactly what's included and excluded in every package.",
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">

      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase mb-4 drop-shadow-sm">Our story</p>
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--text)] font-['Playfair_Display'] leading-tight mb-6">
            We believe travel<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]">
              changes lives.
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Travely was built to make quality travel accessible to everyone — by connecting travelers with trusted local providers who know their destinations best.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Package className="w-5 h-5" />, value: "500+", label: "Packages" },
            { icon: <Users className="w-5 h-5" />, value: "12,000+", label: "Happy travelers" },
            { icon: <Globe className="w-5 h-5" />, value: "50+", label: "Destinations" },
            { icon: <Star className="w-5 h-5" />, value: "4.8★", label: "Average rating" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)] hover:shadow-[var(--shadow)] transition-all duration-300 text-center group">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">{stat.value}</p>
              <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase mb-4 drop-shadow-sm">Our mission</p>
              <h2 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-6 leading-tight">
                Making great travel experiences accessible to all
              </h2>
              <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <p>
                  We started Travely because we saw a gap — travelers couldn't find trustworthy, curated packages, and small travel providers couldn't reach their audience. We built a platform that solves both problems.
                </p>
                <p>
                  Today, Travely connects thousands of travelers with verified local experts across India and beyond. Every package is handpicked, every provider is verified, and every booking is secure.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Kerala Backwaters", "Rajasthan Forts", "Himalayan Trek", "Maldives Escape"].map((dest, i) => (
                <div key={dest} className={`rounded-3xl overflow-hidden aspect-square border border-[var(--border)] shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300 ${i === 1 ? "mt-8" : ""} ${i === 2 ? "-mt-8" : ""}`}>
                  <div className="w-full h-full bg-gradient-to-br from-[var(--accent-soft)] to-[var(--bg-secondary)] flex items-end p-4 relative group cursor-default">
                    {/* Placeholder gradient for missing images */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--overlay-strong)] to-transparent opacity-80" />
                    <p className="text-[var(--on-dark)] text-sm font-bold tracking-wide relative z-10 group-hover:-translate-y-1 transition-transform duration-300">{dest}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 pb-20 border-t border-[var(--border)] pt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase mb-4 drop-shadow-sm">What we stand for</p>
            <h2 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">Our values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((val) => (
              <div key={val.title} className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border-strong)] hover:shadow-[var(--shadow)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center mb-5">
                  {val.icon}
                </div>
                <h3 className="text-[var(--text)] font-bold text-xl font-['Playfair_Display'] mb-3">{val.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase mb-4 drop-shadow-sm">The people</p>
            <h2 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">Meet the team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] hover:shadow-[var(--shadow)] transition-shadow duration-300 text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <span className="text-[var(--accent)] text-3xl font-bold font-['Playfair_Display']">{member.initial}</span>
                </div>
                <h3 className="text-[var(--text)] font-bold text-lg font-['Playfair_Display']">{member.name}</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-1.5 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center p-12 md:p-16 rounded-[2.5rem] border border-[var(--accent-border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[var(--accent-soft)] opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-6 leading-tight">
              Ready to start your journey?
            </h2>
            <p className="text-[var(--text-secondary)] mb-10 text-lg">Join thousands of travelers who trust Travely for their adventures.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/packages"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl brand-gradient text-[var(--on-accent)] font-semibold shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1">
                Browse Packages <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/become-provider"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-semibold hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] transition-all duration-300 active:scale-[0.98]">
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}