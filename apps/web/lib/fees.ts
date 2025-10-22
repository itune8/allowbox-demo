'use client';

import { env, API_ENDPOINTS } from '@repo/config';
import { apiClient } from './api-client';
import { getEntities, payInvoice as payInvoiceStore, type Invoice } from './data-store';

export async function payInvoiceAction(schoolId: string, studentId: string, invoiceId: string): Promise<void> {
  if (env.useApiMocks) {
    payInvoiceStore(schoolId, studentId, invoiceId);
    return;
  }
  // Real API pathway: mark invoice as paid. Adjust endpoint as needed.
  await apiClient.post(API_ENDPOINTS.PAYMENTS, { invoiceId });
}

export function listInvoicesForStudent(schoolId: string, studentId: string): Invoice[] {
  const e = getEntities(schoolId);
  return e.invoices[studentId] || [];
}
