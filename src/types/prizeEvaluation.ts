/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PrizeCategory = 
  | 'smartphones' 
  | 'veiculos' 
  | 'eletronicos' 
  | 'videogames' 
  | 'eletrodomesticos' 
  | 'computadores' 
  | 'relogios_joias' 
  | 'outros';

export type PhysicalCondition = 
  | 'novo_lacrado' 
  | 'seminovo_excelente' 
  | 'bom_marcas_leves' 
  | 'marcas_visiveis_uso';

export type OperationalStatus = 
  | 'totalmente_funcional' 
  | 'funcional_detalhes' 
  | 'nao_testado';

export type InvoiceStatus = 
  | 'possui_com_chave' 
  | 'possui_cupom_fisico' 
  | 'declaracao_conteudo' 
  | 'nao_possui';

export type EvaluationConfidence = 'alta' | 'media' | 'preliminar';

export interface PrizeVisualIdentification {
  category: PrizeCategory;
  categoryLabel: string;
  brand: string;
  model: string;
  year?: string;
  color?: string;
  technicalSpecs?: string;
  confidenceScore: number; // 0 to 1
  detectedObjects: string[];
  visualObservations: string;
}

export interface PrizeOrganizerClarifications {
  correctedCategory: PrizeCategory;
  correctedBrand: string;
  correctedModel: string;
  yearOfManufacture: string;
  capacityOrSpecs: string; // e.g. "128GB", "160cc", "4K HDR 55\""
  condition: PhysicalCondition;
  operationalStatus: OperationalStatus;
  includedAccessories: string[]; // e.g. ["Caixa Original", "Carregador", "Manual"]
  invoiceStatus: InvoiceStatus;
  invoiceAccessKeyMasked?: string;
  notes: string;
}

export interface MarketPriceEstimation {
  minPrice: number;
  probablePrice: number;
  maxPrice: number;
  suggestedRetailPriceNew?: number;
  averageSecondaryPrice?: number;
  confidence: EvaluationConfidence;
  queryDate: string;
  consultedSources: string[];
  pricingNotes: string;
  depreciationFactors: {
    factor: string;
    impactPercentage: number; // e.g. -15%
    description: string;
  }[];
  isPreliminary: boolean;
}

export interface DemonstrativeFinancialSimulation {
  prizeCostAdopted: number;
  organizerAdditionalCosts: number; // e.g. frete, cartório
  totalHypotheticalQuotas: number; // e.g. 1000
  hypotheticalQuotaPrice: number; // e.g. 5.00
  adminExpenseRatePercent: number; // e.g. 5.0%
  paymentGatewayFeePercent: number; // e.g. 1.99%
  refundProvisionPercent: number; // e.g. 2.0%
  // Computed values
  grossRevenueHipothetical: number;
  adminExpensesAmount: number;
  paymentGatewayFeesAmount: number;
  refundProvisionAmount: number;
  totalEstimatedCosts: number;
  netMathematicalBalance: number;
  breakEvenQuotas: number;
  breakEvenPercentage: number;
  marketDiffAmount: number;
  marketDiffPercent: number;
}

export interface AttachedProofDocument {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  uploadTimestamp: string;
  maskedHash: string;
  previewUrl?: string;
  documentType: 'nota_fiscal' | 'recibo_compra' | 'documento_veiculo' | 'declaracao';
}

export interface PrizeEvaluationRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  imageThumbnail: string;
  visualIdentification: PrizeVisualIdentification;
  clarifications: PrizeOrganizerClarifications;
  priceEstimate: MarketPriceEstimation;
  simulation: DemonstrativeFinancialSimulation;
  attachedDocuments: AttachedProofDocument[];
  auditHash: string;
  organizerIdMasked: string;
  legalStatus: 'simulacao_apenas_campanha_bloqueada';
}
