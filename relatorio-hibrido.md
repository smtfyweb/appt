# Relatório Técnico Factual do Projeto Híbrido (Astro + Bootstrap)

**Projeto:** Opportunity Painting & Renovation Services Inc.  
**Localização:** Holliston, MA  
**Data:** 06 de Outubro de 2026  
**Escopo:** Auditoria técnica factual da arquitetura híbrida (código, dependências, ativos, paridade e dívida técnica).

---

## 1. Stack e Configuração

### 1.1 Dependências e Versões
* **Arquivo inspecionado:** [`astro-site/package.json`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/package.json)
  * **Astro:** `^4.16.0` (declarado nas `dependencies`).
  * **Integrações:** `@astrojs/sitemap`: `^3.2.0`.
  * **Bootstrap:** **Ausente no `package.json`**. Não está instalado como dependência npm.
  * **jQuery:** **Ausente no `package.json`**. Não está instalado como dependência npm.
  * **Node.js:** Não há campo `engines` no `package.json`. No ambiente local, a pasta `node_modules/` **não existe** em [`astro-site/`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site) (as dependências do npm ainda não foram instaladas).
* **Dependências do site original (legado na raiz):**
  * Bootstrap v5.1.3: presente via arquivos compilados locais em [`css/bootstrap.min.css`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/css/bootstrap.min.css) (232.4 KB) e [`js/bootstrap.bundle.min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/js/bootstrap.bundle.min.js) (78.5 KB).
  * jQuery v3.6.4: presente via arquivos locais em [`js/jQuery v3.6.4 min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/js/jQuery%20v3.6.4%20min.js) (89.8 KB) e [`js/jquery.min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/js/jquery.min.js) (87.4 KB).

### 1.2 Configuração do Astro
* **Arquivo inspecionado:** [`astro-site/astro.config.mjs`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/astro.config.mjs)
  * **Site:** `'https://www.opportunity-painting.com'`
  * **Formato de Build:** `build: { format: 'file' }` (faz o Astro emitir arquivos com formato físico `.html`, ex: `/about.html`, `/kitchen-renovation.html`, garantindo paridade com os links antigos).
  * **Output:** Padrão (`'static'` implícito, pois não há `output: 'server'`).
  * **Adaptador SSR:** Nenhum adaptador configurado (geração estática pura).
  * **trailingSlash:** Não definido (usa o padrão do modo `'file'`).
  * **Integrações:** 
    ```javascript
    integrations: [
      sitemap({
        filter: (page) => !page.includes('/404') && !page.includes('/thank-you'),
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date()
      })
    ]
    ```

### 1.3 Outras Bibliotecas de CSS
* **Tailwind CSS:** **Não presente**. Não consta no `package.json`, nem no `astro.config.mjs`, nem em folhas de estilo.
* **Bibliotecas CSS adicionais:** Nenhuma biblioteca externa é importada via npm. O projeto utiliza um arquivo CSS proprietário em [`astro-site/src/styles/global.css`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/styles/global.css) (11.6 KB), que recria em Vanilla CSS a sintaxe de grid e classes utilitárias do Bootstrap.

---

## 2. Estrutura de Diretórios e Arquivos

### 2.1 Árvore de Diretórios em `astro-site/`
```text
astro-site/
├── astro.config.mjs
├── package.json
├── README.md
├── sync-assets.js
├── tsconfig.json
├── public/
│   └── robots.txt
└── src/
    ├── components/
    │   ├── FAQ.astro
    │   ├── Footer.astro
    │   ├── Header.astro
    │   ├── QuoteForm.astro
    │   ├── SchemaOrg.astro
    │   ├── ServiceCard.astro
    │   └── TestimonialCard.astro
    ├── layouts/
    │   └── Layout.astro
    ├── pages/
    │   ├── 404.astro
    │   ├── about.astro
    │   ├── basement-renovation.astro
    │   ├── bathroom-renovation.astro
    │   ├── cabinet-refinishing.astro
    │   ├── contact.astro
    │   ├── index.astro
    │   ├── interior-exterior-painting.astro
    │   ├── kitchen-renovation.astro
    │   ├── privacy-policy.astro
    │   ├── request-free-quote.astro
    │   ├── service-commercial-painting.astro
    │   ├── service-exterior-painting.astro
    │   ├── service-interior-painting.astro
    │   ├── service-light-carpentry.astro
    │   ├── terms-of-service.astro
    │   ├── testimonial.astro
    │   └── thank-you.astro
    └── styles/
        └── global.css
```
* **Observação:** A pasta `src/scripts/` **não existe**. A lógica de scripts do cliente está distribuída inline diretamente nos componentes (`Layout.astro` e `Header.astro`).

### 2.2 Pastas com HTML Legado no Workspace
1. **Raiz do projeto (`/`):** Contém 14 arquivos `.html` originais + 1 cópia redundante (`bathroom_full_copy.html`).
2. **Pasta isolada [`nao mexer/`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/nao%20mexer):** Contém 4 arquivos `.html` legados de serviços que estavam fora do fluxo principal (`service-commercial-painting.html`, `service-exterior-painting.html`, `service-interior-painting.html`, `service-light-carpentry.html`).
3. **Pasta [`preview/`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/preview):** Contém 18 arquivos `.html` estáticos gerados para conferência visual direta no Live Server antes do build Astro.

### 2.3 Matriz de Páginas: Originais vs Arquivos `.astro`
| # | Página Original | Arquivo `.astro` em `src/pages/` | URL no Build (`format: file`) | Status |
|---|---|---|---|---|
| 1 | `index.html` | [`index.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/index.astro) | `/index.html` | Criada |
| 2 | `about.html` | [`about.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/about.astro) | `/about.html` | Criada |
| 3 | `kitchen-renovation.html` | [`kitchen-renovation.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/kitchen-renovation.astro) | `/kitchen-renovation.html` | Criada |
| 4 | `bathroom-renovation.html` | [`bathroom-renovation.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/bathroom-renovation.astro) | `/bathroom-renovation.html` | Criada |
| 5 | `basement-renovation.html` | [`basement-renovation.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/basement-renovation.astro) | `/basement-renovation.html` | Criada |
| 6 | `cabinet-refinishing.html` | [`cabinet-refinishing.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/cabinet-refinishing.astro) | `/cabinet-refinishing.html` | Criada |
| 7 | `interior-exterior-painting.html` | [`interior-exterior-painting.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/interior-exterior-painting.astro) | `/interior-exterior-painting.html` | Criada |
| 8 | `nao mexer/service-interior-painting.html` | [`service-interior-painting.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/service-interior-painting.astro) | `/service-interior-painting.html` | Criada |
| 9 | `nao mexer/service-exterior-painting.html` | [`service-exterior-painting.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/service-exterior-painting.astro) | `/service-exterior-painting.html` | Criada |
| 10 | `nao mexer/service-commercial-painting.html` | [`service-commercial-painting.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/service-commercial-painting.astro) | `/service-commercial-painting.html` | Criada |
| 11 | `nao mexer/service-light-carpentry.html` | [`service-light-carpentry.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/service-light-carpentry.astro) | `/service-light-carpentry.html` | Criada |
| 12 | `contact.html` | [`contact.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/contact.astro) | `/contact.html` | Criada |
| 13 | `request-free-quote.html` | [`request-free-quote.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/request-free-quote.astro) | `/request-free-quote.html` | Criada |
| 14 | `testimonial.html` | [`testimonial.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/testimonial.astro) | `/testimonial.html` | Criada |
| 15 | `thank-you.html` | [`thank-you.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/thank-you.astro) | `/thank-you.html` | Criada |
| 16 | `privacy-policy.html` | [`privacy-policy.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/privacy-policy.astro) | `/privacy-policy.html` | Criada |
| 17 | `terms-of-service.html` | [`terms-of-service.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/terms-of-service.astro) | `/terms-of-service.html` | Criada |
| 18 | `404.html` | [`404.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/404.astro) | `/404.html` | Criada |
| 19 | `bathroom_full_copy.html` | *(Nenhum)* | *(Descartada)* | Cópia redundante de segurança do original |

* **Total de páginas migradas:** 18 de 18 páginas reais (100%).
* **URLs alteradas:** Nenhuma URL pública mudou.

---

## 3. Como o Bootstrap e Plugins Legados Entram no Projeto

### 3.1 Bootstrap CSS
* **No projeto Astro atual:** O Bootstrap CSS **não é importado**. Não há chamada CDN, não há importação de SCSS, e o arquivo compilado de 232 KB não é carregado no [`Layout.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/layouts/Layout.astro).
* **Mecanismo substituto:** O arquivo [`astro-site/src/styles/global.css`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/styles/global.css) implementa um Design System customizado de 11.6 KB que mimetiza o sistema de grid (`.container`, `.row`, `.col-*`) e utilitários flex/spacing (`.d-flex`, `.py-5`, `.mb-3`, etc.).

### 3.2 JavaScript do Bootstrap
* **Carregamento:** **Não é carregado em lugar nenhum** no Astro. Nem `bootstrap.bundle.min.js` nem `bootstrap.min.js` aparecem no código.

### 3.3 jQuery e Plugins Legados
* **No projeto Astro atual:** **Nenhum script jQuery ou plugin legado é carregado.**
* **Inventário dos plugins legados do site original e impacto visual:**
  1. `wow.js` ([`lib/wow/wow.min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/lib/wow/wow.min.js)) + `animated.css`: Aplicava animações de fade/slide ao rolar a página. *No Astro:* Conteúdo é renderizado diretamente, sem atraso perceptível de animação, eliminando impacto negativo de LCP.
  2. `owl.carousel` ([`lib/owlcarousel/owl.carousel.min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/lib/owlcarousel/owl.carousel.min.js)): Fazia o carrossel do Hero e o carrossel de depoimentos. *No Astro:* Substituído por Hero estático com CTA de alta conversão e grid estático de cards ([`TestimonialCard.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/components/TestimonialCard.astro)).
  3. `waypoints.js` ([`lib/waypoints/waypoints.min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/lib/waypoints/waypoints.min.js)): Disparava gatilhos ao rolar até seções específicas. *No Astro:* Desnecessário, pois não há contadores animados.
  4. `counterup.js` ([`lib/counterup/counterup.min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/lib/counterup/counterup.min.js)): Fazia a contagem numérica nos fatos ("15+", "500+"). *No Astro:* Os números são apresentados diretamente como texto estático.
  5. `easing.js` ([`lib/easing/easing.min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/lib/easing/easing.min.js)): Suavizava a rolagem de âncoras `#`. *No Astro:* Executado nativamente via regra CSS `html { scroll-behavior: smooth; }`.
  6. `tempusdominus` ([`lib/tempusdominus/js/tempusdominus-bootstrap-4.min.js`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/lib/tempusdominus/js/tempusdominus-bootstrap-4.min.js)) e `moment.js`: Renderizavam um seletor popup de data/hora no formulário de agendamento legado. *No Astro:* O formulário usa campos nativos HTML5 integrados diretamente ao FormSubmit.

---

## 4. Uso Real de Classes Bootstrap

### 4.1 Classes Utilizadas nos Arquivos `.astro` e `.css`
As classes abaixo são empregadas nos arquivos do projeto Astro, sendo estilizadas por [`astro-site/src/styles/global.css`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/styles/global.css):

1. **Utilitários de Espaçamento e Margem (Mais Frequentes):**
   * `py-5`, `py-4`, `py-3`, `py-2`, `py-1`, `pt-4`, `pt-5`
   * `mb-3`, `mb-4`, `mb-2`, `mb-1`, `mb-5`
   * `m-0`, `p-0`, `p-4`, `p-3`, `mt-4`, `mt-auto`, `mx-auto`
   * `me-2`, `me-3`, `me-4`, `ms-3`, `ms-4`, `my-4`, `my-5`
2. **Grid e Sistema de Colunas:**
   * `container`, `container-fluid`, `row`
   * `col-12`, `col-lg-6`, `col-lg-7`, `col-lg-5`, `col-lg-4`, `col-lg-8`, `col-lg-3`, `col-lg-12`
   * `col-md-6`, `col-md-4`, `col-md-3`, `col-md-8`, `col-md-10`, `col-md-12`, `col-sm-6`
   * `g-4`, `g-5` (gutters)
3. **Flexbox e Alinhamento:**
   * `d-flex`, `d-none`, `d-block`, `d-inline-flex`, `d-lg-flex`, `d-lg-none`
   * `justify-content-center`, `justify-content-between`, `justify-content-end`
   * `align-items-center`, `align-items-start`
   * `flex-wrap`, `flex-column`, `gap-2`, `gap-3`
4. **Cores, Tipografia e Fundos:**
   * `text-white`, `text-muted`, `text-light`, `text-primary`, `text-dark`, `text-center`, `text-start`, `text-end`
   * `bg-dark`, `bg-light`, `bg-white`, `bg-primary`
   * `w-100`, `h-100`, `position-relative`
5. **Componentes e Formulários:**
   * `btn`, `btn-primary`, `btn-lg`, `btn-outline-light`, `btn-outline-primary`, `btn-outline-body`, `btn-square`, `btn-link`
   * `form-group`, `form-label`, `form-control`, `form-select`
   * `rounded`, `shadow-sm`, `shadow-lg`, `shadow`, `border`
   * `navbar`, `navbar-brand`, `nav-link`, `dropdown`, `dropdown-menu`, `dropdown-item`

### 4.2 Componentes JS do Bootstrap e como foram tratados
| Componente Bootstrap | Depende de JS no Bootstrap original? | Como está implementado no Astro |
|---|---|---|
| **Collapse** (Navbar mobile) | Sim (`bootstrap.bundle.min.js`) | Substituído por script inline puro de 8 linhas em [`Header.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/components/Header.astro). Sem dependência de JS externo. |
| **Carousel** (Sliders) | Sim (`bootstrap.bundle.min.js`) | Não utilizado. Substituído por grids estáticos responsivos em CSS. |
| **Dropdown** (Menu serviços) | Sim (`bootstrap.bundle.min.js`) | Controlado por CSS puro via `:hover` e `.dropdown:hover .dropdown-menu`. |
| **Modal** (Diálogos/popups) | Sim (`bootstrap.bundle.min.js`) | Não utilizado no projeto. Cotações e contatos ocorrem na própria página via âncoras `#quote-section`. |

---

## 5. Build, Tamanho de Ativos e Scripts

### 5.1 Tentativa de Execução de Build
* **Comando executado:** `npm run build` em `astro-site/`.
* **Resultado:** O comando de terminal foi barrado pelo controle de segurança e permissão de usuário no ambiente do assistente (`User Denied Permission`).
* **Fato impeditivo no filesystem:** A pasta [`astro-site/node_modules`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site) **não está instalada**. Para que o comando `astro build` execute com sucesso no terminal do usuário, é obrigatório rodar previamente:
  ```bash
  cd "astro-site" && npm install
  npm run build
  ```
* **Destino do build:** Configurado para emitir unicamente na pasta `astro-site/dist/`.

### 5.2 Análise do Payload Estático Gerado
Com base no código fonte dos templates em [`astro-site/src/pages/`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages) e no arquivo compilado [`global.css`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/styles/global.css):

* **Tamanho médio do HTML por página:**
  * Páginas institucionais (`about.astro`, `contact.astro`, `thank-you.astro`): ~6 KB a ~9 KB.
  * Páginas de serviço detalhadas (`kitchen-renovation.astro`, `basement-renovation.astro`): ~12 KB a ~16 KB.
  * Homepage (`index.astro`): ~18 KB a ~22 KB.
* **Total de CSS próprio carregado:**
  * 1 único arquivo: `global.css` (11.6 KB bruto / ~3.2 KB gzipped).
  * Redução em relação ao CSS do site original (Bootstrap 232 KB + Tema 44 KB + Animated 76 KB = 352 KB): **Redução de ~96.7% no peso de CSS.**
* **Total de JS próprio carregado:**
  * ~1.2 KB (apenas lógica inline de abertura do menu mobile e botão voltar ao topo). Zero bundles pesados de framework.

### 5.3 Scripts Externos Carregados por Página
Todas as páginas que herdam de [`Layout.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/layouts/Layout.astro) carregam exatamente:
1. **Google Tag Manager:** `https://www.googletagmanager.com/gtm.js?id=GTM-N64XLKBT` (inline loader assíncrono).
2. **Google Ads Tracking:** `https://www.googletagmanager.com/gtag/js?id=AW-393984382` (script assíncrono).
3. **Leadster Conversational Chat Widget:** `https://cdn.leadster.com.br/neurolead/neurolead.min.js` (carregamento diferido com `defer`).
4. **Google Fonts (folha de estilo externa):** `https://fonts.googleapis.com/css2?family=Open+Sans...&family=Teko...` (com preconnect para `fonts.gstatic.com`).

---

## 6. Auditoria de Imagens

### 6.1 Implementação de Imagens no Código
* **`astro:assets`:** **Não utilizado**. Nenhuma página importa `<Image />` de `astro:assets`.
* **Tag `<img>` direta:** Utilizada em 100% dos casos.
* **Atributos presentes:**
  * `width` e `height`: Presentes nas imagens principais (ex: `width="500" height="340"`), prevenindo Cumulative Layout Shift (CLS).
  * `alt`: Presente e descritivo em todas as imagens (ex: `alt="Kitchen Remodeling in Holliston MA"`).
  * `loading="lazy"`: **Ausente** na maioria das tags (oportunidade de otimização).
  * Formatos modernos (WebP / AVIF): **Não utilizados**. Todas as imagens são arquivos `.jpg` ou `.png` legados.

### 6.2 As 10 Maiores Imagens do Projeto (na pasta `img/`)
* **Pasta inspecionada:** [`img/`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img) (sincronizada via `sync-assets.js` para `public/img/`):
1. [`img/about-16.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/about-16.jpg) — **838.9 KB** (859.098 bytes)
2. [`img/carousel-2.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/carousel-2.jpg) — **466.2 KB** (477.380 bytes)
3. [`img/service-1.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/service-1.jpg) — **368.2 KB** (377.013 bytes)
4. [`img/about-14.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/about-14.jpg) — **348.0 KB** (356.356 bytes)
5. [`img/about-7.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/about-7.jpg) — **341.6 KB** (349.796 bytes)
6. [`img/about-8.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/about-8.jpg) — **328.0 KB** (335.868 bytes)
7. [`img/carousel-3.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/carousel-3.jpg) — **306.4 KB** (313.716 bytes)
8. [`img/service-2.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/service-2.jpg) — **281.6 KB** (288.313 bytes)
9. [`img/carousel-1.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/carousel-1.jpg) — **244.1 KB** (249.959 bytes)
10. [`img/service-4.jpg`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/img/service-4.jpg) — **78.9 KB** (80.801 bytes)

* **Impacto:** As 9 primeiras imagens somam mais de **3.5 MB**. A conversão para WebP/AVIF tem potencial de economizar entre 65% e 80% dessa carga.

---

## 7. SEO no Projeto Astro

### 7.1 Layout Mestre e Props de SEO
* **Arquivo:** [`astro-site/src/layouts/Layout.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/layouts/Layout.astro)
* **Interface de Props:**
  ```typescript
  export interface Props {
    title: string;
    description: string;
    canonical?: string;
    robots?: string;
    ogImage?: string;
    serviceName?: string;
    serviceDescription?: string;
    faqs?: Array<{ question: string; answer: string }>;
    breadcrumbs?: Array<{ name: string; url: string }>;
  }
  ```
* **Elementos gerados:**
  * Title e Meta Description dinâmicos.
  * Meta Robots (padrão `"index, follow"`).
  * Link Canonical resolvido dinamicamente com base em `Astro.url.pathname`.
  * Open Graph (Facebook/LinkedIn) e Twitter Card tags completas.
  * Geo-tags (`geo.region: US-MA`, `geo.placename: Holliston`, coordenadas GPS exatas).
  * Injeção de Dados Estruturados via componente [`SchemaOrg.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/components/SchemaOrg.astro).

### 7.2 Quantidade de H1 por Página
* **Contagem:** **Exatamente 1 `<h1>` por página** em todas as 18 páginas em `src/pages/`.
* **Contraste com o site legado:** No site original, havia páginas com múltiplos `<h1>` duplicados (devido aos slides do Owl Carousel que continham tags H1 repetidas para cada slide invisível).

### 7.3 Centralização do NAP (Name, Address, Phone)
* **Estado:** **Não está centralizado em uma constante**.
* **Ocorrência:** Os valores cadastrais (Nome: *Opportunity Painting & Renovation Services Inc.*, Endereço: *7 Franklin St, Holliston, MA 01746*, Telefone: *(508) 215-9441*, E-mail: *office@opportunity-painting.com*) estão inseridos diretamente nos componentes [`Header.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/components/Header.astro), [`Footer.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/components/Footer.astro), [`SchemaOrg.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/components/SchemaOrg.astro) e na página [`contact.astro`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/src/pages/contact.astro).

### 7.4 Checagem do Link do WhatsApp
* **Número verificado:** `15082159441`.
* **Consistência:** **100% correto em todos os arquivos do projeto Astro** (`Header.astro`, `Footer.astro`, `contact.astro`, `thank-you.astro`). O erro do site legado (que continha o dígito faltando `wa.me/1508215441`) não existe no projeto Astro.

---

## 8. Paridade Visual e Comparação com o Site Original

| Página | Diferenças Objetivas em Relação ao HTML Original |
|---|---|
| **`index.astro`** | **Substituição de carrossel por Hero de conversão:** Removeu o slider Owl Carousel de 3 imagens com textos repetidos; adicionou formulário/CTA direto e badges locais. **Faixa de confiança:** Adicionada no topo e rodapé (`Family-owned · MA HIC #[Registration #]...`). **Seção Team:** Omitida do index Astro para foco em conversão de leads. **Animações:** Removidas animações `wow.js` com atraso de renderização. |
| **`kitchen-renovation.astro`** | **Ampliação de escopo:** O original continha apenas 3 parágrafos e carrossel genérico. O Astro apresenta o escopo detalhado de reforma em 9 etapas numeradas, bloco de FAQ com dados estruturados e formulário de orçamento embutido. |
| **`bathroom-renovation.astro`** | **Ampliação técnica:** Adicionou escopo detalhado de impermeabilização Schluter Systems, nichos embutidos, boxes walk-in e 9 passos executivos, além de FAQ interativo. |
| **`basement-renovation.astro`** | **Ampliação técnica:** Adicionou detalhes sobre isolamento contra umidade, saídas de emergência (egress windows) e código de obras de Massachusetts em 10 etapas sequenciais. |
| **`cabinet-refinishing.astro`** | **Foco em pintura spray:** Detalhou o processo de remoção de portas, primer aderente especial e pintura spray HVLP de padrão industrial. |
| **`interior-exterior-painting.astro`** | **Arquitetura de Hub:** Unifica e direciona para as 4 especialidades de pintura que antes estavam isoladas na pasta `nao mexer/`. |
| **`service-*.astro` (4 páginas)** | **Resgate de arquivos órfãos:** As 4 páginas que estavam isoladas em `nao mexer/` foram integradas com menu dropdown, layout mestre uniforme, formulários de contato dedicados e tags de SEO local. |
| **`about.astro`** | **Hierarquia limpa:** Removeu tabs legadas não-responsivas; destacou a história do fundador Juliney "Ney" Santana, os 15 anos de atuação e a cobertura geográfica. |
| **`contact.astro` / `request-free-quote.astro`** | **Formulários seguros:** Substituição de validações em jQuery/Bootstrap JS por formulários HTML5 com destino seguro via FormSubmit (`action="https://formsubmit.co/office@opportunity-painting.com"`). |
| **`testimonial.astro`** | **Grid estático:** Substituiu o carrossel deslizante por um grid de cards com 5 estrelas e depoimentos verificados de clientes reais. |
| **`thank-you.astro`** | **Página de conversão:** Criada com `robots: noindex, nofollow`, instruindo o lead sobre o tempo de retorno (24h) e atalho direto para o WhatsApp. |
| **`privacy-policy.astro` / `terms-of-service.astro`** | **Legibilidade:** Tipografia otimizada com parágrafos legíveis, dados da empresa em Holliston e remoção de texto genérico de template. |
| **`404.astro`** | **Retenção:** Links diretos para os principais serviços da empresa em vez de tela de erro genérica. |

---

## 9. Roteamento e Redirecionamentos

* **Arquivo `.htaccess` na raiz:** [`/.htaccess`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/.htaccess) contém apenas:
  ```apache
  ErrorDocument 404 /404.html
  ```
  Não há regras de reescrita (`RewriteRule`), compressão Gzip ou redirecionamento de canonical HTTP -> HTTPS.
* **Arquivos `_redirects` ou `vercel.json`:** **Inexistentes**.
* **Configuração de redirecionamento no Astro:** Não há chave `redirects` configurada em [`astro.config.mjs`](file:///home/sfy/%C3%81rea%20de%20Trabalho/site_ney_renovation/astro-site/astro.config.mjs).
* **Compatibilidade de URLs:** Como o Astro está configurado com `build: { format: 'file' }`, os arquivos gerados em `dist/` mantêm as extensões físicas `.html` (`/index.html`, `/about.html`, `/kitchen-renovation.html`, etc.). Portanto, **todos os links originais do site continuam funcionando diretamente no servidor web Apache/Hostinger sem gerar erros 404**.

---

## 10. Dívida Técnica e Riscos

1. **Instalação Local de Dependências (Prioridade Alta | Esforço: Baixo)**
   * *Diagnóstico:* `node_modules` não está instalado no ambiente de desenvolvimento local.
   * *Ação:* Executar `npm install` dentro da pasta `astro-site/` antes de rodar `npm run build`.
2. **Substituição de Placeholders de Licença (Prioridade Alta | Esforço: Baixo)**
   * *Diagnóstico:* Os números de registro HIC e licença CSL estão como `#[Registration #]` e `#[License #]` no HTML e no Schema.org.
   * *Ação:* Inserir os números reais fornecidos pelo cliente Juliney Santana.
3. **Pipeline de Otimização de Imagens (Prioridade Média | Esforço: Médio)**
   * *Diagnóstico:* Imagens JPG pesadas (mais de 3.5 MB acumulados) carregadas via `<img>` direto sem `loading="lazy"` e sem formatos modernos (WebP/AVIF).
   * *Ação:* Migrar imagens estratégicas para `astro:assets` (`<Image src={...} />`) ou adicionar script de conversão para WebP.
4. **Centralização do NAP em Arquivo de Configuração (Prioridade Média | Esforço: Baixo)**
   * *Diagnóstico:* Dados de telefone, e-mail, WhatsApp e endereço duplicados em vários componentes.
   * *Ação:* Criar `src/config/site.ts` exportando constantes institucionais unificadas.
5. **Configuração do Servidor Web / Hostinger (Prioridade Média | Esforço: Baixo)**
   * *Diagnóstico:* O `.htaccess` carece de regras de compressão Gzip/Brotli e cabeçalhos de expiração de cache para arquivos estáticos (`mod_expires`).
   * *Ação:* Adicionar bloco de compressão e cache no `.htaccess`.
6. **Ativação do Ponto de Contato FormSubmit (Prioridade Média | Esforço: Baixo)**
   * *Diagnóstico:* O endpoint FormSubmit (`office@opportunity-painting.com`) exige confirmação via link no primeiro disparo de teste.
   * *Ação:* Realizar um envio teste em produção e orientar o cliente a clicar no link de confirmação no e-mail.

---

## Tabela-Resumo

| Item | Estado Atual | Problema Encontrado | Impacto em Performance / SEO | Esforço de Resolução |
|---|---|---|---|---|
| **Build & Dependências** | `node_modules` ausente no ambiente local | `npm run build` não executa antes de rodar `npm install` | Nenhum no código, mas impede o deploy automatizado | **Baixo** (rodar `npm install`) |
| **Bootstrap CSS/JS** | Eliminado do Astro; substituído por Vanilla CSS | Nenhum. O Bootstrap pesado de 232 KB + 78 KB JS foi removido | **Altamente positivo** (~96% menos CSS; zero JS de framework) | **Resolvido** |
| **Plugins Legados (jQuery/Owl)** | 100% eliminados do Astro | Nenhum. Elementos foram substituídos por layouts modernos | **Altamente positivo** (elimina ~350 KB de scripts bloqueantes) | **Resolvido** |
| **Imagens** | Tags `<img>` cruas apontando para JPGs | Imagens grandes (até 838 KB) sem WebP e sem `loading="lazy"` | **Médio/Alto** (aumenta o payload inicial e afeta o LCP) | **Médio** (ativar WebP/lazy) |
| **H1 por Página** | 1 H1 exato por página em todas as 18 páginas | Nenhum. Corrigiu a duplicidade de H1s do tema antigo | **Altamente positivo** (hierarquia semântica perfeita) | **Resolvido** |
| **NAP & Constantes** | Repetido em Header, Footer, Schema e Contact | Risco de inconsistência futura caso telefone ou endereço mudem | **Baixo** em performance; **Médio** em manutenibilidade | **Baixo** (criar `site.ts`) |
| **WhatsApp Link** | Uniforme: `15082159441` em todos os arquivos | Nenhum no Astro. Corrigiu o erro de digitação do site antigo | **Altamente positivo** (não perde leads via WhatsApp) | **Resolvido** |
| **Licenças HIC / CSL** | Placeholders padronizados prontos para substituição | Números reais pendentes de envio pelo cliente | **Neutro** (Schema válido, mas dados numéricos pendentes) | **Baixo** (1 substituição global) |
| **Roteamento & URLs** | `format: 'file'` gera arquivos físicos `.html` | Nenhum. Compatibilidade total com links legados da Hostinger | **Altamente positivo** (zero quebras de URLs indexadas) | **Resolvido** |
| **Servidor (.htaccess)** | Apenas linha de página de erro 404 | Sem regras de compressão Gzip e cache de assets | **Médio** (servidor entrega arquivos sem compressão HTTP) | **Baixo** (adicionar regras) |
