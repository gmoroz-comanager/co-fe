export interface BrandProfile {
  id: number;
  documentId: string;
  identity: string;
  values?: string[];
  tone?: string[];
  humorLevel?: number;
  audience?: string[];
  pains?: string[];
  goals?: string[];
  targetLanguage?: string;
  styleLexicon?: string[];
  avoidLexicon?: string[];
  contentPillars?: string[];
  channelsPriority?: string[];
  cadence?: string;
  ctaStyles?: string[];
  tabooTopics?: string[];
  sampleHooks?: string[];
  sampleCTAs?: string[];
  postAngles?: string[];
}

