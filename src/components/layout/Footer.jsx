import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  UserRound,
} from "lucide-react";

import logo from "../../assets/codeverse-logo.png";

function Footer() {
  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Courses", href: "#courses" },
    { name: "About", href: "#about" },
  ];

  const resources = [
    { name: "Python", href: "#courses" },
    { name: "JavaScript", href: "#courses" },
    { name: "Java", href: "#courses" },
  ];

  return (
    <footer className="border-t border-white/[0.08] bg-[#080812] px-6 pb-8 pt-16 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <a href="#home" className="inline-flex items-center">
              <img
                src={logo}
                alt="CODEVERSE Logo"
                className="h-12 w-auto object-contain"
              />
            </a>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Learn programming in a smarter way with interactive
              lessons, real-time code execution, visual learning,
              and your personal AI coding tutor.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-300">
              Learn. Code. Create.
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-white">
              Quick Links
            </h3>

            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-purple-400"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Paths */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-white">
              Learning Paths
            </h3>

            <ul className="space-y-4">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    className="text-sm text-slate-400 transition hover:text-purple-400"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Contact */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-white">
              Developer Contact
            </h3>

            <ul className="space-y-5">

              <li className="flex items-start gap-3">
                <UserRound size={18} className="mt-0.5 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-500">Developer</p>
                  <p className="text-sm font-medium text-slate-300">
                    Charuni Hansika
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <a
                    href="mailto:hansikachl721@gmail.com"
                    className="break-all text-sm text-slate-400 transition hover:text-purple-400"
                  >
                    hansikachl721@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <a
                    href="tel:0761234567"
                    className="text-sm text-slate-400 transition hover:text-purple-400"
                  >
                    076 275 3853
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm text-slate-400">
                    Sri Lanka
                  </p>
                </div>
              </li>

            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-7 sm:flex-row">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} CODEVERSE. All rights reserved.
          </p>

          <a
            href="#home"
            className="text-xs font-medium text-slate-400 transition hover:text-purple-400"
          >
            Back to top ↑
          </a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;