import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden">

      {/* Ambient background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">

        {/* Hero */}
        <section className="max-w-3xl mx-auto text-center mb-16">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles size={14} />
            We're here to help
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Let's talk about
            <span className="text-indigo-400"> JobPulse.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Have a question, found an issue, or have feedback about JobPulse?
            Send us a message and we'll do our best to help.
          </p>

        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">

          {/* Left: Contact Information */}
          <div className="lg:col-span-5 space-y-6">

            <div>
              <h2 className="text-2xl font-bold text-white">
                How can we help?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Whether you're searching for your next opportunity or using
                JobPulse to stay on top of the job market, we're here to help
                make the experience better.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">

              <div className="group bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-slate-900 transition-all">
                <div className="flex items-start gap-4">

                  <div className="w-11 h-11 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Mail size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      General inquiries
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Questions about JobPulse or how the platform works.
                    </p>

                    <a
                      href="mailto:support@jobpulse.com"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      support@jobpulse.com
                      <ArrowRight size={14} />
                    </a>
                  </div>

                </div>
              </div>

              <div className="group bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-slate-900 transition-all">
                <div className="flex items-start gap-4">

                  <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <MessageSquare size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Feedback & suggestions
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Have an idea that could make JobPulse better?
                      We'd love to hear it.
                    </p>
                  </div>

                </div>
              </div>

              <div className="group bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-slate-900 transition-all">
                <div className="flex items-start gap-4">

                  <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Job or account issues
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Report incorrect listings, account problems, or
                      notification issues.
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* Response time */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <Clock3 size={17} className="text-indigo-400 shrink-0" />

              <p className="text-xs text-slate-400">
                We aim to respond to messages as soon as possible.
              </p>
            </div>

          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">

              {submitted ? (

                /* Success State */
                <div className="min-h-[480px] flex flex-col items-center justify-center text-center">

                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                    <CheckCircle2 size={30} />
                  </div>

                  <h2 className="text-2xl font-bold text-white">
                    Message sent
                  </h2>

                  <p className="mt-3 text-sm text-slate-400 max-w-md leading-relaxed">
                    Thanks for reaching out to JobPulse. Your message has been
                    received and we'll get back to you as soon as possible.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-7 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
                  >
                    Send another message
                  </button>

                </div>

              ) : (

                <>
                  <div className="mb-7">
                    <h2 className="text-xl font-bold text-white">
                      Send us a message
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Tell us what's on your mind. The more details you provide,
                      the easier it is for us to help.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      <div>
                        <label
                          htmlFor="name"
                          className="block text-xs font-semibold text-slate-300 mb-2"
                        >
                          Name
                        </label>

                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your name"
                          required
                          className="w-full bg-slate-950/70 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-semibold text-slate-300 mb-2"
                        >
                          Email
                        </label>

                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          className="w-full bg-slate-950/70 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>

                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-xs font-semibold text-slate-300 mb-2"
                      >
                        What can we help with?
                      </label>

                      <select
                        id="subject"
                        name="subject"
                        required
                        defaultValue=""
                        className="w-full bg-slate-950/70 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      >
                        <option value="" disabled>
                          Select a topic
                        </option>
                        <option value="general">
                          General question
                        </option>
                        <option value="job-listing">
                          Report a job listing
                        </option>
                        <option value="account">
                          Account issue
                        </option>
                        <option value="alerts">
                          Job alerts / notifications
                        </option>
                        <option value="feedback">
                          Feedback or suggestion
                        </option>
                        <option value="technical">
                          Technical issue
                        </option>
                        <option value="other">
                          Something else
                        </option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-xs font-semibold text-slate-300 mb-2"
                      >
                        Message
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        placeholder="Tell us how we can help..."
                        required
                        className="w-full bg-slate-950/70 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-950/50 inline-flex items-center justify-center gap-2 border border-indigo-500/30"
                    >
                      <Send size={16} />
                      Send Message
                    </button>

                    <p className="text-[11px] text-center text-slate-600">
                      Please don't include passwords or other sensitive
                      account information in your message.
                    </p>

                  </form>
                </>

              )}

            </div>

          </div>

        </section>

        {/* Bottom CTA */}
        <section className="max-w-6xl mx-auto mt-16">

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                Looking for opportunities?
              </div>

              <h3 className="text-lg font-bold text-white">
                Your next opportunity might already be waiting.
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Explore the latest jobs collected by JobPulse.
              </p>
            </div>

            <a
              href="/jobs"
              className="shrink-0 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all"
            >
              Browse Jobs
              <ArrowRight size={16} />
            </a>

          </div>

        </section>

      </div>
    </main>
  );
};

export default ContactUs;

