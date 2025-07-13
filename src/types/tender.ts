export interface TenderValue {
  amount: number;
  currency: string | null;
}

export interface TenderPeriod {
  startDate: string | null;
  endDate: string | null;
}

export interface EnquiryPeriod {
  startDate: string | null;
  endDate: string | null;
}

export interface Classification {
  scheme: string | null;
  id: string | null;
  description: string | null;
}

export interface ProcuringEntity {
  id: string | null;
  name: string | null;
}

export interface Buyer {
  id: string | null;
  name: string | null;
}

export interface Document {
  id: string | null;
  documentType: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  datePublished: string | null;
  dateModified: string | null;
  format: string | null;
  language: string | null;
}

export interface Award {
  id: string | null;
  title: string | null;
  status: string | null;
  description: string | null;
  value: TenderValue | null;
  suppliers: Supplier[] | null;
}

export interface Supplier {
  id: string | null;
  name: string | null;
}

export interface Tender {
  id: string | null;
  title: string | null;
  status: string | null;
  mainProcurementCategory: string | null;
  additionalProcurementCategories: string[] | null;
  description: string | null;
  reviewDetails: string | null;
  hasEnquiries: boolean | null;
  eligibilityCriteria: string | null;
  submissionMethod: string[] | null;
  submissionMethodDetails: string | null;
  classification: Classification | null;
  value: TenderValue | null;
  tenderPeriod: TenderPeriod | null;
  enquiryPeriod: EnquiryPeriod | null;
  procuringEntity: ProcuringEntity | null;
  procurementMethod: string | null;
  procurementMethodDetails: string | null;
  documents: Document[] | null;
}

export interface Release {
  ocid: string | null;
  id: string | null;
  date: string | null;
  tag: string[] | null;
  description: string | null;
  initiationType: string | null;
  tender: Tender | null;
  buyer: Buyer | null;
  language: string | null;
  awards: Award[] | null;
}

export interface Publisher {
  name: string | null;
  scheme: string | null;
  uid: string | null;
  uri: string | null;
}

export interface Links {
  next: string | null;
  prev: string | null;
}

export interface ReleasePackage {
  uri: string | null;
  version: string | null;
  publishedDate: string | null;
  publisher: Publisher | null;
  license: string | null;
  publicationPolicy: string | null;
  releases: Release[] | null;
  links: Links | null;
}