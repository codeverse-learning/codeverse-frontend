
import { Code2, Menu, X } from "lucide-react";
import { useState } from "react";

import logo from "../../assets/codeverse-logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Courses", href: "#courses" },
    { name: "About", href: "#about" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#080812]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#home" className="flex items-center gap-2">
          <img
            src={logo}
            alt="CODEVERSE Logo"
            className="h-12 w-auto object-contain"
            />

          <span className="text-xl font-extrabold tracking-wide text-white">
            CODE<span className="text-purple-400">VERSE</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            Log In
          </a>

          <a
            href="/register"
            className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-105"
          >
            Get Started
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#080812] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                {link.name}
              </a>
            ))}

            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-white"
            >
              Log In
            </a>

            <a
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
