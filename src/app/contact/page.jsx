"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState({ submitted: false, submitting: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState({ ...formState, submitting: true });
    
    // Simulate API call
    setTimeout(() => {
      setFormState({ submitted: true, submitting: false });
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-background relative overflow-hidden">
      <div className="noise" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-12 bg-accent-red" />
            <span className="text-xs uppercase tracking-[0.4em] text-accent-red font-semibold">Connect</span>
          </div>

          <h1 className="text-gradient font-display text-[clamp(48px,10vw,80px)] font-bold leading-none tracking-[-0.04em] mb-8">
            Get in <br /> <span className="font-serif-jp italic font-medium text-accent-red [-webkit-text-fill-color:var(--color-accent-red)]">Touch</span>
          </h1>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg text-foreground font-medium">
              Questions about our embroidered collections? Need help with an order? We're here for you.
            </p>
            <div className="pt-4 space-y-2">
              <p><strong className="text-foreground font-bold">Email:</strong> support@zowers.com</p>
              <p><strong className="text-foreground font-bold">Press:</strong> press@zowers.com</p>
              <p><strong className="text-foreground font-bold">HQ:</strong> Karachi, Pakistan</p>
            </div>
          </div>
        </div>

        <div className="bg-surface/50 p-8 border border-white/5 backdrop-blur-md">
          {formState.submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="h-16 w-16 bg-accent-red/20 text-accent-red rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-2xl font-bold font-display text-foreground">Message Received</h3>
              <p className="text-muted-foreground">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              <button 
                onClick={() => setFormState({ submitted: false, submitting: false })}
                className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-accent-red hover:text-white transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Name</label>
                <input required type="text" id="name" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent-red transition-colors" placeholder="Your Name" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Email</label>
                <input required type="email" id="email" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent-red transition-colors" placeholder="your@email.com" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Subject</label>
                <select required id="subject" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent-red transition-colors appearance-none text-muted-foreground">
                  <option value="" disabled selected>Select a subject</option>
                  <option value="order">Order Support</option>
                  <option value="product">Product Information</option>
                  <option value="press">Press & Collaboration</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Message</label>
                <textarea required id="message" rows="5" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent-red transition-colors resize-none" placeholder="How can we help you?"></textarea>
              </div>

              <button 
                type="submit" 
                disabled={formState.submitting}
                className="group relative inline-flex items-center gap-4 overflow-hidden bg-foreground px-8 py-4 text-[11px] w-full justify-center font-bold uppercase tracking-[0.3em] text-background transition-all disabled:opacity-70"
              >
                <span className="relative z-10">{formState.submitting ? 'Sending...' : 'Send Message'}</span>
                {!formState.submitting && <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                <div className="absolute inset-0 -translate-x-full bg-accent-red transition-transform duration-500 group-hover:translate-x-0" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
