import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Scale, Building2, FileCheck, TrendingUp, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 via-background to-secondary/20" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Professional Qiymətləndirmə</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6 animate-fade-in-up">
                Professional Qiymətləndirmə Xidmətləri
              </h1>
              <p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 text-pretty animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                Azərbaycanda etibarlı və səmərəli qiymətləndirmə həlləri ilə biznesinizi inkişaf etdirin
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <Button
                  asChild
                  size="lg"
                  className="gap-2 group transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
                >
                  <Link href="/elaqe">
                    Bizimlə əlaqə saxlayın
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="transition-all duration-300 hover:bg-accent/5 bg-transparent"
                >
                  <Link href="/xidmetler">Xidmətlərimiz</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 lg:px-8 bg-secondary/30">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Niyə bizi seçməlisiniz?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                İlin təcrübəsi və professional komandamız ilə sizə ən yaxşı xidməti təqdim edirik
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border hover-lift group animate-fade-in-up" style={{ animationDelay: "0s" }}>
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <Scale className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Obyektivlik</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Qərəzsiz və ədalətli qiymətləndirmə metodları ilə işləyirik
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover-lift group animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <Building2 className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Təcrübə</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Müxtəlif sektorlarda çoxillik professional təcrübə
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover-lift group animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <FileCheck className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Keyfiyyət</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Beynəlxalq standartlara uyğun hesabatlar
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover-lift group animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <TrendingUp className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Səmərəlilik</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Tez və dəqiq nəticələr əldə edin</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/10 via-background to-secondary/10" />

          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Layihəniz haqqında danışaq</h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Professional komandamız sizə kömək etməyə hazırdır
            </p>
            <Button
              asChild
              size="lg"
              className="gap-2 group transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
            >
              <Link href="/elaqe">
                Konsultasiya alın
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
