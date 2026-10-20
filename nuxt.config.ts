// Modelo 09 · Pavimentação e calçada — On Track LP
// Endereço público do site (usado na prévia do WhatsApp/Instagram). Em domínio próprio: LP_URL=https://www.cliente.com.br/
const SITE = process.env.LP_URL || 'https://devagenciaontrack-sys.github.io/lp-modelo-09-ontrack/'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    // GitHub Pages: LP_BASE=/<repo>/ · Vercel/domínio próprio: deixe vazio
    baseURL: process.env.LP_BASE || '/',
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Sua Pavimentação — Bloquete, meio-fio e calçada',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Pavimentação em bloquete, meio-fio e calçada. Simule a metragem, veja o padrão de assentamento e peça o orçamento pelo WhatsApp.' },
        { name: 'theme-color', content: '#101114' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Sua Pavimentação — Bloquete, meio-fio e calçada' },
        { property: 'og:description', content: 'Simule a metragem da sua obra, escolha o padrão de assentamento e receba o orçamento pelo WhatsApp.' },
        { property: 'og:url', content: SITE },
        { property: 'og:image', content: SITE + 'og.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'pt_BR' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=Barlow+Condensed:wght@600;700&display=swap' },
        { rel: 'icon', href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23101114'/%3E%3Cg fill='%23F59E1B'%3E%3Crect x='5' y='8' width='9' height='6' rx='1'/%3E%3Crect x='17' y='8' width='9' height='6' rx='1'/%3E%3Crect x='5' y='17' width='9' height='6' rx='1'/%3E%3Crect x='17' y='17' width='9' height='6' rx='1'/%3E%3C/g%3E%3C/svg%3E" },
      ],
    },
  },
})
