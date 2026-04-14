"use client";

import { useState } from "react";
import Link from "next/link";
import { DoorOpen, Menu, User, X } from "lucide-react";
import { Button, Avatar } from "@/app/components/blog/ui";
import { clsx } from "clsx";

export interface NavLink {
  href: string;
  label: string;
}

export type NavbarViewer = {
  id: string;
  name: string;
  surname: string;
  image: string | null;
};

interface NavbarClientProps {
  navLinks?: NavLink[];
  brandName?: string;
  viewer?: NavbarViewer | null;
}

const EMPTY_NAV_LINKS: NavLink[] = [];

/**
 * Klientská část navigace (UI + mobile menu).
 * @param {NavbarClientProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} Navbar.
 */
export default function NavbarClient({
  navLinks = EMPTY_NAV_LINKS,
  brandName = "Plexus",
  viewer = null,
}: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = Boolean(viewer?.id);

  const defaultLinks: NavLink[] = [
    { href: "/", label: "Domovská stránka" },
    { href: "/articles", label: "Články" },
  ];

  const links = navLinks.length > 0 ? navLinks : defaultLinks;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="w-full">
      <div className="z-999 bg-[#f6f5ff]/75 mask-linear-to-b mask-b-from-25% mask-b-to-100% backdrop-blur-sm h-24 absolute top-0 left-0 w-full" />
      <div className="z-9999 max-w-screen-2xl mx-auto px-4 lg:px-8 relative">
        <div className="flex items-center justify-between py-3 md:py-6">
          <div className="flex flex-col">
            <Link
              href="/"
              className="text-dark tracking-tighter font-extrabold text-2xl mb-1 hover:text-primary transition-colors"
              onClick={closeMenu}
            >
              {brandName}
            </Link>
          </div>

          <ul className="hidden md:flex h-fit items-center gap-0.5 bg-white/75 backdrop-blur-sm rounded-full p-1">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="text-zinc-600 tracking-tight font-medium text-sm hover:text-primary bg-transparent hover:bg-primary/10 transition-colors px-3 py-2 rounded-full"
              >
                {link.label}
              </Link>
            ))}
          </ul>

          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated && viewer ? (
              <Link
                href="/account/profile"
                className="group flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/75 backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer"
              >
                <Avatar
                  src={viewer.image || undefined}
                  alt={`${viewer.name}${viewer.surname ? ` ${viewer.surname}` : ""}`.trim()}
                  size="xs"
                />
                <span className="text-xs font-semibold tracking-tight text-zinc-700 group-hover:text-white transition-colors">
                  {`${viewer.name}${viewer.surname ? ` ${viewer.surname}` : ""}`.trim()}
                </span>
              </Link>
            ) : (
              <Button href="/account/auth/log-in" variant="primary" size="md">
                <User size={16} />
                Přihlásit se
              </Button>
            )}
          </nav>

          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated && viewer ? (
              <Link
                href="/account/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/75 backdrop-blur-sm hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={closeMenu}
              >
                <Avatar
                  src={viewer.image || undefined}
                  alt={`${viewer.name}${viewer.surname ? ` ${viewer.surname}` : ""}`.trim()}
                  size="sm"
                />
                <span className="text-sm font-medium tracking-tight text-zinc-700">
                  {`${viewer.name}${viewer.surname ? ` ${viewer.surname}` : ""}`.trim()}
                </span>
              </Link>
            ) : (
              <Button
                href="/account/auth/log-in"
                variant="primary"
                size="sm"
                className="hidden sm:flex"
              >
                Přihlásit se
              </Button>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-zinc-800 hover:text-primary transition-colors cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div
          className={clsx(
            "rounded-xl bg-white/90 backdrop-blur-sm absolute top-16 translate-x-[-50%] left-1/2 w-[95%] md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="p-2">
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="block p-2 text-zinc-700 tracking-tight font-medium text-sm hover:text-zinc-800 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated && viewer ? (
                <li>
                  <Link
                    href="/account/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-2 p-2 text-zinc-700 tracking-tight font-medium text-sm hover:text-zinc-800 hover:bg-primary rounded-lg transition-colors cursor-pointer"
                  >
                    <Avatar
                      src={viewer.image || undefined}
                      alt={`${viewer.name}${viewer.surname ? ` ${viewer.surname}` : ""}`.trim()}
                      size="xs"
                    />
                    <span>
                      {`${viewer.name}${viewer.surname ? ` ${viewer.surname}` : ""}`.trim()}
                    </span>
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    href="/account/auth/log-in"
                    onClick={closeMenu}
                    className="w-full flex items-center gap-2 bg-primary hover:bg-primary/80 p-2 text-white tracking-tight font-medium text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    <DoorOpen size={16} />
                    Přihlásit se
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
