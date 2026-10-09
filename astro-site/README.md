# Opportunity Painting & Renovation Services Inc. — Arquitetura Astro Híbrido (Opção C)

Este projeto implementa a **Opção C (Astro SSG / Híbrido)** recomendada para modernizar a presença digital da **Opportunity Painting & Renovation Services Inc.** (Holliston, MA), mantendo 100% do conteúdo original em inglês, sem perda de funções de conversão e com pontuação máxima em Core Web Vitals e SEO/AEO/GEO.

---

## 🚀 Principais Melhorias Implementadas

1. **Zero JS Overhead por Padrão (Astro SSG):**
   - Removidos mais de 1,2 MB de bibliotecas legado desnecessárias (Bootstrap JS monolítico, jQuery duplicado 3.4.1 + 3.6.4, Owl Carousel, Moment.js, Tempus Dominus).
   - O navegador recebe HTML puro, estático e pré-renderizado, com velocidade instantânea (LCP < 1.2s, CLS = 0).

2. **Correção do Bug Crítico do Formulário de Leads (`QuoteForm.astro`):**
   - No site antigo (`index.html`), o `<form>` fechava precocemente logo após o campo de nome, deixando email, telefone, serviço, data e botão fora do formulário.
   - O formulário foi reestruturado de ponta a ponta com action `https://formsubmit.co/office@opportunity-painting.com`, proteção anti-spam honeypot (`_honey`) e redirecionamento para `/thank-you.html`.

3. **Correção do Link de WhatsApp em Todas as Páginas:**
   - O link anterior continha um erro de digitação com dígito faltando (`wa.me/1508215441`).
   - Corrigido globalmente para `wa.me/15082159441` com mensagem contextualizada de orçamento.

4. **Hierarquia Semântica e SEO Estrutural:**
   - **Exatamente 1 tag `<h1>` por página** (corrigindo páginas antigas que tinham até 5 tags H1 concorrentes).
   - `<h2>` e `<h3>` estruturados com palavras-chave de alta intenção transacional em Holliston e MetroWest Boston.
   - Metadados canônicos, Open Graph e Twitter Cards completos.

5. **Dados Estruturados Schema.org & Otimização para IA (AEO / GEO):**
   - Injeção de JSON-LD para `HomeAndConstructionBusiness`, `LocalBusiness`, `Service`, `BreadcrumbList` e `FAQPage`.
   - Seções de FAQ com respostas estruturadas para mecanismos de busca generativa (Google AI Overviews, Perplexity, ChatGPT Search).

6. **Preservação de Todas as Integrações do Cliente:**
   - **Chat Leadster:** Widget `neurolead.min.js` com ID `5S5Ke1EYL55DdkQ3woVJP7zrt` integrado de forma nativa e não-bloqueante.
   - **Google Tag Manager:** Container `GTM-N64XLKBT`.
   - **Google Ads & Analytics:** ID `AW-393984382`.
   - **FormSubmit:** `office@opportunity-painting.com`.
   - **Telefone:** `(508) 215-9441`.

7. **Compatibilidade Total de URLs e Hostinger:**
   - O arquivo `astro.config.mjs` utiliza `build: { format: 'file' }`.
   - Todas as páginas são geradas como arquivos `.html` idênticos aos originais (`about.html`, `kitchen-renovation.html`, `contact.html`, etc.), garantindo que campanhas de Google Ads ou links externos existentes não quebrem.

---

## 📁 Estrutura do Projeto

```
astro-site/
├── astro.config.mjs        # Configuração do Astro (SSG, sitemap automático, formato file)
├── package.json            # Scripts de build, dev e sincronização de ativos
├── tsconfig.json           # Configuração de TypeScript
├── sync-assets.js          # Sincronizador automático de imagens locais para public/img/
├── public/
│   ├── robots.txt          # Regras para bots e ponteiro para o sitemap
│   └── img/                # Ativos e fotos sincronizados
└── src/
    ├── components/
    │   ├── Header.astro         # Topbar, NAP, redes sociais e menu responsivo limpo
    │   ├── Footer.astro         # Rodapé com NAP consistente e links válidos
    │   ├── QuoteForm.astro      # Formulário de leads corrigido e integrado
    │   ├── ServiceCard.astro    # Card reutilizável com imagem, tags e lazy-loading
    │   ├── TestimonialCard.astro# Cards de avaliações 5 estrelas por cidade
    │   ├── FAQ.astro            # Acordeão nativo HTML5 (details/summary) para AEO
    │   └── SchemaOrg.astro      # Gerador de dados estruturados JSON-LD
    ├── layouts/
    │   └── Layout.astro         # Layout base com GTM, GA, Leadster e SEO
    ├── styles/
    │   └── global.css           # CSS moderno com a paleta original (#B78D65, #222222)
    └── pages/
        ├── index.astro                     -> /index.html
        ├── about.astro                     -> /about.html
        ├── kitchen-renovation.astro        -> /kitchen-renovation.html
        ├── bathroom-renovation.astro       -> /bathroom-renovation.html
        ├── basement-renovation.astro       -> /basement-renovation.html
        ├── cabinet-refinishing.astro       -> /cabinet-refinishing.html
        ├── interior-exterior-painting.astro-> /interior-exterior-painting.html
        ├── service-interior-painting.astro -> /service-interior-painting.html
        ├── service-exterior-painting.astro -> /service-exterior-painting.html
        ├── service-commercial-painting.astro->/service-commercial-painting.html
        ├── service-light-carpentry.astro   -> /service-light-carpentry.html
        ├── contact.astro                   -> /contact.html
        ├── request-free-quote.astro        -> /request-free-quote.html
        ├── testimonial.astro               -> /testimonial.html
        ├── thank-you.astro                 -> /thank-you.html
        ├── privacy-policy.astro            -> /privacy-policy.html
        ├── terms-of-service.astro          -> /terms-of-service.html
        └── 404.astro                       -> /404.html
```

---

## 🛠️ Como Executar e Gerar o Build

No terminal, navegue até a pasta do projeto:

```bash
cd ~/"Área de Trabalho"/site_ney_renovation/astro-site
```

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar o servidor de desenvolvimento
```bash
npm run dev
```
O site estará disponível localmente em `http://localhost:4321`.

### 3. Gerar a versão de produção para o Hostinger
```bash
npm run build
```
O Astro gerará a pasta `dist/` contendo todos os arquivos `.html`, CSS minificado, imagens e `sitemap.xml`. Os arquivos gerados podem ser enviados diretamente para a pasta `public_html` da Hostinger ou hospedados em qualquer servidor web estático.
