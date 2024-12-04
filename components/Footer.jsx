import Link from "next/link";

/**
 * Footer component that displays the footer section of the website.
 *
 * The footer includes:
 * - Navigation links for "About Us", "Contact", and "Terms of Service"
 * - Social media icons with links to Facebook, Twitter, and Instagram
 * - Copyright information with the current year
 * - A decorative border with a tagline "Crafted with passion for food lovers everywhere"
 *
 * The component uses Tailwind CSS for styling and is responsive, displaying a grid layout on larger screens and a single-column layout on smaller screens.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
export default function Footer() {
  return (
    <footer className="bg-teal-800 dark:bg-teal-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Navigation Links */}
          <nav className="flex justify-center md:justify-start">
            <ul className="flex flex-wrap gap-6 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-teal-200 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#6D9773] transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#6D9773] transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </nav>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-6">
            <a
              href="https://www.facebook.com"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.089.016 1.723.08v3.077h-1.184c-1.39 0-1.806.704-1.806 2.155v2.246h3.666l-.823 3.667h-2.843v7.98h4.044c.264 0 .478-.214.478-.478V.478c0-.264-.214-.478-.478-.478H.478C.214 0 0 .214 0 .478v22.735c0 .264.214.478.478.478h8.623z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-center md:text-right text-white">
            <p>&copy; {new Date().getFullYear()} RecipeApp.</p>
            <p className="text-teal-200">All rights reserved.</p>
          </div>
        </div>

        {/* Decorative Border */}
        <div className="border-t border-teal-700 dark:border-teal-800 py-4">
          <p className="text-xs text-center text-gray-300 dark:text-gray-400">
            Crafted with passion for food lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
