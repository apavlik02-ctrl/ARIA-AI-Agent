'use client';

import React from 'react';

export default function ARIALandingPage() {
  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-[1100px] mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div className="text-2xl font-semibold tracking-[3px]">ARIA</div>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#how" className="hover:text-white transition-colors">How it Works</a>
            <a 
              href="/login" 
              className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/5 transition-all"
            >
              Log in
            </a>
            <a 
              href="/signup" 
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium hover:opacity-90 transition-all"
            >
              Start Free
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <div className="max-w-[1100px] mx-auto px-6">
          <h1 className="text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
            The AI coach that actually<br />understands insurance licensing.
          </h1>
          <p className="text-xl text-[#EDE0D4]/70 max-w-[620px] mx-auto mb-10">
            Personalized quizzes, adaptive study plans, and real coaching — built specifically for U.S. insurance exams.
          </p>

          <div className="flex gap-4 justify-center">
            <a 
              href="/signup" 
              className="px-9 py-4 rounded-full bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium text-lg hover:opacity-90 transition-all"
            >
              Start 14-day free trial
            </a>
            <a 
              href="#pricing" 
              className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/5 transition-all text-lg"
            >
              See pricing
            </a>
          </div>
          <p className="mt-5 text-sm text-[#EDE0D4]/50">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="py-8 bg-white/[0.015] text-center text-sm text-[#EDE0D4]/60">
        Trusted by candidates preparing for exams in all 50 states
      </div>

      {/* Features */}
      <section id="features" className="max-w-[1100px] mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-semibold mb-3">Everything you need to pass — intelligently</h2>
          <p className="text-lg text-[#EDE0D4]/70">ARIA combines deep insurance knowledge with adaptive learning tools.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Adaptive Quizzes", desc: "Smart practice questions that focus on your weak areas instead of wasting time on what you already know." },
            { title: "Personalized Study Plans", desc: "Study schedules built around your exam date, current readiness, and the topics that matter most." },
            { title: "Readiness Tracking", desc: "See your real progress with domain-level scoring, streaks, and gap analysis — not just guesswork." },
            { title: "State-Specific Guidance", desc: "Accurate regulation lookup and explanations across all 50 states, with deeper coverage for high-volume states." },
            { title: "AI Coaching", desc: "Get clear explanations, mnemonics, and exam strategy from an AI trained specifically on insurance licensing content." },
            { title: "Progress That Matters", desc: "Track readiness percentage, weak domains, and study consistency over time." },
          ].map((feature, index) => (
            <div key={index} className="bg-[#1A120A] border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-3 text-[#C9874F]">{feature.title}</h3>
              <p className="text-[#EDE0D4]/80">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="max-w-[1100px] mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-semibold">How ARIA works</h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-12">
          {[
            { num: "1", title: "Tell ARIA about your exam", desc: "Share your exam date, state, and current comfort level. ARIA creates your baseline." },
            { num: "2", title: "Get a personalized plan", desc: "Receive a custom study schedule that focuses on your weak areas and respects your timeline." },
            { num: "3", title: "Practice with purpose", desc: "Take adaptive quizzes, review detailed explanations, and watch your readiness score rise." },
          ].map((item, index) => (
            <div key={index} className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#C9874F] text-[#1A120A] flex-shrink-0 flex items-center justify-center text-xl font-bold">
                {item.num}
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                <p className="text-[#EDE0D4]/80 text-lg">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-[1100px] mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-semibold mb-3">Simple pricing for serious candidates</h2>
          <p className="text-lg text-[#EDE0D4]/70">Start free. Upgrade when you're ready to get serious.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="bg-[#1A120A] border border-white/10 rounded-3xl p-9">
            <div className="text-[#C9874F] font-semibold tracking-wider text-sm">FREE</div>
            <div className="text-6xl font-bold my-4">$0</div>
            <div className="text-[#EDE0D4]/60 mb-8">Forever</div>

            <ul className="space-y-3 mb-10 text-[#EDE0D4]/90">
              <li>✓ Limited quizzes</li>
              <li>✓ Basic explanations</li>
              <li>✓ Sample study plans</li>
            </ul>

            <a href="/signup" className="block text-center py-3.5 rounded-2xl border border-white/20 hover:bg-white/5 transition-all">
              Get started free
            </a>
          </div>

          {/* Pro - Popular */}
          <div className="bg-[#1A120A] border border-[#C9874F] rounded-3xl p-9 relative scale-[1.015]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9874F] text-[#1A120A] text-xs font-bold tracking-[1px] px-5 py-1 rounded-full">
              MOST POPULAR
            </div>
            
            <div className="text-[#C9874F] font-semibold tracking-wider text-sm">PRO</div>
            <div className="text-6xl font-bold my-1">$29 <span className="text-2xl font-normal text-[#EDE0D4]/60">/mo</span></div>
            <div className="text-[#EDE0D4]/60 mb-8">or $79 for 90 days</div>

            <ul className="space-y-3 mb-10 text-[#EDE0D4]/90">
              <li>✓ Unlimited adaptive quizzes</li>
              <li>✓ Full personalized study plans</li>
              <li>✓ Advanced readiness tracking</li>
              <li>✓ All 50 states + regulations</li>
              <li>✓ Progress history & streaks</li>
              <li>✓ Priority support</li>
            </ul>

            <a href="/signup" className="block text-center py-3.5 rounded-2xl bg-gradient-to-r from-[#C9874F] to-[#A0522D] font-medium">
              Start 14-day trial
            </a>
            <p className="text-center text-xs text-[#EDE0D4]/50 mt-3">Cancel anytime</p>
          </div>

          {/* Agency */}
          <div className="bg-[#1A120A] border border-white/10 rounded-3xl p-9">
            <div className="text-[#C9874F] font-semibold tracking-wider text-sm">AGENCY</div>
            <div className="text-6xl font-bold my-1">$99 <span className="text-2xl font-normal text-[#EDE0D4]/60">/mo</span></div>
            <div className="text-[#EDE0D4]/60 mb-8">Up to 10 seats</div>

            <ul className="space-y-3 mb-10 text-[#EDE0D4]/90">
              <li>✓ Everything in Pro</li>
              <li>✓ Team dashboard & analytics</li>
              <li>✓ Manager overview of progress</li>
              <li>✓ Bulk onboarding tools</li>
              <li>✓ Priority support + training</li>
            </ul>

            <a href="/contact" className="block text-center py-3.5 rounded-2xl border border-white/20 hover:bg-white/5 transition-all">
              Contact sales
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center bg-white/[0.03]">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-4xl font-semibold mb-4">Ready to study with purpose?</h2>
          <p className="text-[#EDE0D4]/70 max-w-md mx-auto mb-8">
            Join candidates across the country who are passing faster with ARIA.
          </p>
          <a 
            href="/signup" 
            className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium text-lg hover:opacity-90 transition-all"
          >
            Start your free trial
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 text-center text-sm text-[#EDE0D4]/50">
        <div className="max-w-[1100px] mx-auto px-6">
          © 2026 ARIA. Built to help insurance professionals pass with confidence.<br />
          Not affiliated with any state Department of Insurance or exam provider.
        </div>
      </footer>
    </div>
  );
}
