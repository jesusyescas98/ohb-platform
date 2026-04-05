/**
 * Lead Bridge — Single point of lead capture for all public-facing forms.
 * Saves to both legacy localStorage (ohb_leads) and LeadsDB (database.ts).
 */

import { LeadsDB } from './database';
import type { LeadRecord } from './database';

export interface PublicLeadData {
  name?: string;
  phone?: string;
  email: string;
  message?: string;
  propertyId?: string;
  propertyTitle?: string;
  source: 'portal web' | 'whatsapp' | 'calculadora' | 'chatbot' | 'newsletter' | 'formulario';
  interestType?: 'compra' | 'venta' | 'renta' | 'inversion';
}

export function savePublicLead(data: PublicLeadData): string {
  const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = Date.now();

  // 1. Save to legacy localStorage key (ohb_leads) for backward compat
  try {
    const legacyLeads = JSON.parse(localStorage.getItem('ohb_leads') || '[]');
    legacyLeads.push({
      id,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email,
      message: data.message || '',
      propertyId: data.propertyId || '',
      propertyTitle: data.propertyTitle || '',
      source: data.source,
      status: 'nuevo',
      notes: '',
      createdAt: now,
      updatedAt: now,
    });
    localStorage.setItem('ohb_leads', JSON.stringify(legacyLeads));
  } catch {
    // localStorage not available
  }

  // 2. Save to LeadsDB (database.ts) for dashboard visibility
  try {
    const leadRecord: LeadRecord = {
      id,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email,
      rfc: '',
      interestType: data.interestType || 'compra',
      interest: data.propertyTitle
        ? `Propiedad: ${data.propertyTitle}`
        : data.message || 'Contacto desde portal web',
      budgetMin: 0,
      budgetMax: 0,
      creditType: 'otro',
      zoneOfInterest: '',
      bedroomsNeeded: 0,
      squareMetersNeeded: 0,
      civilStatus: '',
      dependents: 0,
      monthlyIncome: 0,
      prequalified: false,
      prequalifiedAmount: 0,
      nextAction: 'Contactar',
      nextActionDate: new Date().toISOString().split('T')[0],
      priority: 'media',
      notes: [
        data.message ? `Mensaje: ${data.message}` : '',
        data.propertyId ? `Propiedad ID: ${data.propertyId}` : '',
      ].filter(Boolean).join('\n'),
      requiredDocuments: [],
      advisor: '',
      firstContactDate: new Date().toISOString().split('T')[0],
      lastInteraction: new Date().toISOString().split('T')[0],
      progressPercent: 0,
      source: data.source,
      score: 50,
      status: 'nuevos',
      tags: data.propertyId ? ['portal', 'propiedad'] : ['portal'],
      createdAt: now,
      updatedAt: now,
    };

    LeadsDB.upsert(leadRecord);
  } catch {
    // DB not available
  }

  return id;
}
