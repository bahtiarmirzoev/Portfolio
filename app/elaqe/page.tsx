"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would go here
    console.log("Form submitted:", formData)
    alert("Müraciətiniz qəbul edildi! Tezliklə sizinlə əlaqə saxlayacağıq.")
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="pt-32 pb-16 px-6 lg:px-8 bg-secondary/30">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Əlaqə</h1>
            <p className="text-lg text-muted-foreground max-w-3xl text-pretty">
              Bizimlə əlaqə saxlayın və suallarınızı verin
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           
              <div className="col-span-2">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Əlaqə məlumatları</h2>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    Bizimlə birbaşa əlaqə saxlaya və ya ofisimizi ziyarət edə bilərsiniz.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0 transition-all duration-300 group-hover:bg-primary/20">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2 text-lg">Telefon</h3>
                          <p className="text-sm text-muted-foreground">+994 50 380 15 02</p>
                           <p className="text-sm text-muted-foreground">+994 70 380 15 02</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0 transition-all duration-300 group-hover:bg-primary/20">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2 text-lg">Email</h3>
                          <p className="text-sm text-muted-foreground">premium.qiymetlendirme@gmail.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0 transition-all duration-300 group-hover:bg-primary/20">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2 text-lg">Ünvan</h3>
                          <p className="text-sm text-muted-foreground">Bakı şəhəri, Nərimanov rayonu AP plaza</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0 transition-all duration-300 group-hover:bg-primary/20">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2 text-lg">İş saatları</h3>
                          <p className="text-sm text-muted-foreground mb-1">Bazar ertəsi - Cümə</p>
                          <p className="text-sm text-muted-foreground">09:00 - 18:00</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-12">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Google Maps карта */}
                      <div className="aspect-[21/9] w-full">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.222901280286!2d49.83105567631063!3d40.40391257144164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4030874d869bb079%3A0x25f62100ccee9f09!2sAP%20Plaza!5e0!3m2!1sru!2saz!4v1765887518569!5m2!1sru!2saz"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Premium şirkətinin ünvanı - AP Plaza, Bakı"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}