"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Ana səhifə", href: "/" },
  { name: "Haqqımızda", href: "/haqqimizda" },
  { name: "Xidmətlər", href: "/xidmetler" },
  { name: "Əlaqə", href: "/elaqe" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled
          ? "bg-background/98 backdrop-blur-xl border-b border-border/80 shadow-2xl shadow-accent/5"
          : "bg-background/95 backdrop-blur-md border-b border-border/30",
      )}
    >
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          <Link href="/" className="flex items-center group relative">
            <div className="relative transition-all duration-500">
              <Image
                src="/logo.png"
                alt="PREMIUM Logo"
                width={180}
                height={72}
                className={cn(
                  "transition-all duration-500 brightness-100 group-hover:brightness-110 group-hover:scale-105",
                  scrolled ? "h-14 w-auto" : "h-16 w-auto",
                )}
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:gap-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group",
                  pathname === item.href
                    ? "text-foreground bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/5",
                )}
              >
                {item.name}
                <span
                  className={cn(
                    "absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-accent via-accent/80 to-accent rounded-full transition-all duration-300",
                    pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                />
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg transition-all duration-200 active:scale-95 hover:bg-accent/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Menyu</span>
            <div className="relative w-6 h-6">
              <X
                className={cn(
                  "absolute inset-0 h-6 w-6 transition-all duration-300",
                  mobileMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0",
                )}
              />
              <Menu
                className={cn(
                  "absolute inset-0 h-6 w-6 transition-all duration-300",
                  mobileMenuOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100",
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-500 ease-in-out",
            mobileMenuOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col gap-y-2 pt-4 bg-accent/5 rounded-xl p-4">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-3 text-base font-medium transition-all duration-300 rounded-lg hover:translate-x-1",
                  pathname === item.href ? "text-foreground bg-accent/20" : "text-muted-foreground hover:bg-accent/10",
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
