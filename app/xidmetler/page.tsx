import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building, Home, Factory, Car, FileText, Wrench, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Building,
    title: "Daşınmaz əmlakın qiymətləndirilməsi",
    description: "Yaşayış və qeyri-yaşayış sahələrinin, torpaq sahələrinin professional qiymətləndirilməsi.",
  },
  {
    icon: Home,
    title: "Mənzil və ofislərin qiymətləndirilməsi",
    description: "Alqı-satqı, icarə və ipoteka məqsədləri üçün mənzil və ofislərin qiymətləndirilməsi.",
  },
  {
    icon: Factory,
    title: "Sənaye obyektlərinin qiymətləndirilməsi",
    description: "Zavod, fabrik və digər sənaye müəssisələrinin dəyərinin müəyyənləşdirilməsi.",
  },
  {
    icon: Car,
    title: "Avtonəqliyyat vasitələrinin qiymətləndirilməsi",
    description: "Yüngül və yük avtomobillərinin, xüsusi texnikaların qiymətləndirilməsi.",
  },
  {
    icon: Wrench,
    title: "Dəymiş zərərin qiymətləndirilməsi",
    description: "İSığorta hadisələri, hüquqi mübahisələr və başqa səbəblərdən yaranan maddi zərərin miqdarının müəyyən edilməsi.",
  },
  {
    icon: FileText,
    title: "Biznesin qiymətləndirilməsi",
    description: "Şirkətlərin və biznes aktivlərinin bazar dəyərinin müəyyən edilməsi.",
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="pt-32 pb-16 px-6 lg:px-8 bg-secondary/30">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Xidmətlərimiz</h1>
            <p className="text-lg text-muted-foreground max-w-3xl text-pretty">
              Geniş spektrli professional qiymətləndirmə xidmətləri ilə sizin xidmətinizdəyik
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Mobile and Tablet: 1-2 колонки */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6 mb-16">
              {services.map((service, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
                >
                  <CardHeader className="pb-4">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: 3 карточки в строку, теперь 6 карточек = 2 строки */}
            <div className="hidden lg:block mb-16">
              {/* Первые 3 карточки */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {services.slice(0, 3).map((service, index) => (
                  <Card 
                    key={index} 
                    className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
                  >
                    <CardHeader className="pb-4">
                      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Последние 3 карточки */}
              <div className="grid grid-cols-3 gap-6">
                {services.slice(3, 6).map((service, index) => (
                  <Card 
                    key={index + 3} 
                    className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
                  >
                    <CardHeader className="pb-4">
                      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Process Section */}
            <div className="border-t border-border pt-16">
              <h2 className="text-3xl font-bold text-center mb-12">İş prosesimiz</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Müraciət</h3>
                  <p className="text-sm text-muted-foreground">Bizimlə əlaqə saxlayın və tələblərinizi bildirin</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Analiz</h3>
                  <p className="text-sm text-muted-foreground">Obyektin ətraflı təhlili və məlumat toplanması</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Qiymətləndirmə</h3>
                  <p className="text-sm text-muted-foreground">Professional metodlar əsasında qiymətləndirmə</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    4
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Hesabat</h3>
                  <p className="text-sm text-muted-foreground">Ətraflı qiymətləndirmə hesabatının təqdim edilməsi</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-20 text-center bg-secondary/30 rounded-lg p-12">
              <h2 className="text-3xl font-bold mb-4 text-balance">Xidmətlərimiz haqqında ətraflı məlumat əldə edin</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Komandamız sizə ən uyğun həlli təklif etməyə hazırdır
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link href="/elaqe">
                  Bizimlə əlaqə saxlayın
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}