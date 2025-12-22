"use client";

import Link from "next/link";
import { Messages } from "@/lib/i18n";

interface FooterProps {
  locale: string;
  messages: Messages;
}

export default function Footer({ locale, messages }: FooterProps) {

  return (
    <footer className="bg-gradient-to-t from-gray-100 dark:from-gray-900 to-white dark:to-primary-black border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img
                src="/logo.jpg"
                alt="HS6Tools"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="text-gray-900 dark:text-white font-bold text-2xl">HS6Tools</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md text-justify leading-relaxed">
              {messages.footer.companyDescription}
            </p>
            <div className="flex space-x-4">
              {/* Instagram Link */}
              <a 
                href="https://www.instagram.com/hs6.tools?igsh=MWdjOTg0NjJjb2R0Yg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 glass rounded-xl flex items-center justify-center text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6">{messages.footer.company}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/about`} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  {messages.navigation.about}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  {messages.navigation.contact}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  {messages.navigation.blog}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6">{messages.footer.support}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/faq`} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  {messages.footer.faq}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {messages.footer.copyright}
            </div>
            
            {/* E-Namad Trust Seal - Non-blocking load with error handling */}
            {/* Note: e-namad logo may not load on localhost - it requires production domain */}
            <div 
              className="flex items-center justify-center min-h-[60px]"
              dangerouslySetInnerHTML={{
                __html: `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=672815&Code=uTJMZOh3491RFLi2w3AvM2s9AmsVM5tf'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=672815&Code=uTJMZOh3491RFLi2w3AvM2s9AmsVM5tf' alt='' style='cursor:pointer' code='uTJMZOh3491RFLi2w3AvM2s9AmsVM5tf' loading='lazy' decoding='async' onerror='this.style.display=\"none\"; this.parentElement.style.display=\"none\";' onload='this.style.opacity=\"1\";'></img></a>`
              }}
            />
            
            <div className="flex space-x-6 text-sm">
              <Link href={`/${locale}/privacy`} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200">
                {messages.footer.privacyPolicy}
              </Link>
              <Link href={`/${locale}/terms`} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200">
                {messages.footer.termsOfService}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
