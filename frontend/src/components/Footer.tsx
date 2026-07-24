import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 font-sans border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-gray-800">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white tracking-tight">job<span className="text-indigo-500">Pulse</span></span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed">
              Connecting ambitious talent with forward-thinking companies instantly. Real-time tracking, seamless applications, and smart hiring.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Stay ahead of the hiring curve</h3>
            <p className="text-sm mb-4">Get curated job insights, salary trends, and remote work opportunities straight to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input type="email" placeholder="Enter your work email" required className="bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 flex-grow" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer">Subscribe</button>
            </form>
          </div>

        </div>

        {/* Middle Section: Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-800 text-sm">
          
          {/* Col 1: Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-xs">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              <li><a href="#" className="hover:text-white transition-colors">What's New</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>

          {/* Col 2: Job Seekers */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-xs">Job Seekers</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Salary Calculator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Resume Builder</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Career Advice</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Remote Hub</a></li>
            </ul>
          </div>

          {/* Col 3: Employers */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-xs">Employers</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Talent Solutions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Recruiter Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Recruiter Portal</a></li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-xs">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full ml-1 font-semibold">We're hiring</span></a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>&copy; 2026 jobPulse, Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Security</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;