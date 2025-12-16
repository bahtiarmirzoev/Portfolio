import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Award, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="pt-32 pb-16 px-6 lg:px-8 bg-secondary/30">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Haqqımızda</h1>
            <p className="text-lg text-muted-foreground max-w-3xl text-pretty">
              PREMIUM Qiymətləndirmə MMC - Azərbaycanda lider qiymətləndirmə şirkəti
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              <div>
                <h2 className="text-3xl font-bold mb-6">Bizim missiyamız</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PREMIUM Qiymətləndirmə MMC olaraq, biz Azərbaycanda ən yüksək standartlarda qiymətləndirmə xidmətləri
                  təqdim etməyi hədəfləyirik. Müştərilərimizə obyektiv, peşəkar və etibarlı qiymətləndirmə həlləri
                  təqdim etməklə, onların biznes qərarlarında etibarlı tərəfdaş oluruq.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Beynəlxalq standartlara və yerli tələblərə uyğun olaraq, hər bir layihəyə fərdi yanaşma ilə yanaşır və
                  müştərilərimizin ehtiyaclarını ən yüksək səviyyədə qarşılayırıq.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Bizim vizyonumuz</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Azərbaycanda qiymətləndirmə sənayesinin inkişafına töhfə verərək, regional bazarda lider mövqe
                  qazanmaq və beynəlxalq aləmdə tanınan professional təşkilat olmaq.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Daim innovasiyaya açıq, müştəri məmnuniyyətini prioritet sayan və komandamızın inkişafına dəstək verən
                  bir şirkət olaraq, sektorda örnək təşkilat olmağı hədəfləyirik.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-center mb-12">Dəyərlərimiz</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Dəqiqlik</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Hər bir qiymətləndirmədə maksimum dəqiqlik
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Müştəri Məmnuniyyəti</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Müştərilərimizin ehtiyacları bizim prioritetimizdir
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Professionallıq</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Yüksək keyfiyyətli və professional xidmət
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Məxfilik</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Müştəri məlumatlarının tam təhlükəsizliyi
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
