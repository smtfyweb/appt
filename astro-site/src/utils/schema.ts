import { siteConfig } from '../siteConfig';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getHousePainterSchema() {
  const founder: Record<string, any> = {
    "@type": "Person",
    "name": "Juliney Santana"
  };

  if (siteConfig.credentials.csl) {
    founder.hasCredential = {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "license",
      "name": "Massachusetts Construction Supervisor License (CSL)"
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "HousePainter",
    "@id": "https://www.opportunity-painting.com/#business",
    "name": siteConfig.name,
    "legalName": siteConfig.legalName,
    "url": "https://www.opportunity-painting.com/",
    "logo": "https://www.opportunity-painting.com/img/icons/icon-1.png",
    "image": "https://www.opportunity-painting.com/img/carousel-3.jpg",
    "telephone": "+1-508-215-9441",
    "email": siteConfig.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "7 Franklin St",
      "addressLocality": "Holliston",
      "addressRegion": "MA",
      "postalCode": "01746",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 42.200664,
      "longitude": -71.420965
    },
    "areaServed": siteConfig.serviceAreas.map((city) => ({
      "@type": "City",
      "name": city,
      "addressRegion": "MA"
    })),
    "founder": founder,
    "sameAs": [
      "https://www.instagram.com/opportunity_painting",
      "https://www.facebook.com/profile.php?id=100050506784663",
      "https://www.youtube.com/channel/UC4Asa7w8FHFXJ0NzoZ4Xpyg",
      "https://www.youtube.com/@opportunity-painting",
      "https://www.yelp.com/biz/opportunity-painting-renovation-holliston",
      "https://www.homeadvisor.com/rated.OpportunityPaintingand.91196958.html"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Painting & Renovation Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Bathroom Renovation",
            "url": "https://www.opportunity-painting.com/bathroom-renovation.html"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Basement Renovation",
            "url": "https://www.opportunity-painting.com/basement-renovation.html"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Kitchen Renovation",
            "url": "https://www.opportunity-painting.com/kitchen-renovation.html"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Kitchen Cabinet Refinishing",
            "url": "https://www.opportunity-painting.com/service-kitchen-cabinet-refinishing.html"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Interior Painting",
            "url": "https://www.opportunity-painting.com/service-interior-painting.html"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Exterior Painting",
            "url": "https://www.opportunity-painting.com/service-exterior-painting.html"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Commercial Painting",
            "url": "https://www.opportunity-painting.com/service-commercial-painting.html"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Light Carpentry",
            "url": "https://www.opportunity-painting.com/service-light-carpentry.html"
          }
        }
      ]
    }
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
