import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">PREMIUM</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Qiymətləndirmə MMC - Azərbaycanda professional və etibarlı qiymətləndirmə xidmətləri.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Keçidlər</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Ana səhifə
                </Link>
              </li>
              <li>
                <Link href="/haqqimizda" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Haqqımızda
                </Link>
              </li>
              <li>
                <Link href="/xidmetler" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Xidmətlər
                </Link>
              </li>
              <li>
                <Link href="/elaqe" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Əlaqə
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Əlaqə</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+994 12 XXX XX XX</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@premium.az</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Bakı, Azərbaycan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PREMIUM Qiymətləndirmə MMC. Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </footer>
  )
}
