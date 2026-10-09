export interface SiteCredentials {
  hic: string | null;
  csl: boolean;
  insured: boolean;
  epaLogo: boolean;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  phone: string;
  displayPhone: string;
  email: string;
  address: string;
  whatsappUrl: string;
  credentials: SiteCredentials;
  serviceAreas: string[];
  experienceYears: number;
}

export const siteConfig: SiteConfig = {
  name: "Opportunity Painting",
  legalName: "Opportunity Painting And Renovation Services Inc.",
  phone: "+15082159441",
  displayPhone: "(508) 215-9441",
  email: "office@opportunity-painting.com",
  address: "7 Franklin St, Holliston, MA 01746, US",
  whatsappUrl: "https://wa.me/message/K3QVFUZOUZVXO1",
  experienceYears: 15,
  credentials: {
    hic: null,
    csl: true,
    insured: true,
    epaLogo: false,
  },
  serviceAreas: [
    'Holliston',
    'Framingham',
    'Hopkinton',
    'Milford',
    'Medway',
    'Ashland',
    'Sherborn',
    'Millis',
    'Medfield',
    'Natick',
    'Franklin',
    'Dover'
  ],
};
