import { apiClient } from '../api-client';

export enum ItemCategory {
  FURNITURE = 'FURNITURE',
  ELECTRONICS = 'ELECTRONICS',
  SPORTS = 'SPORTS',
  LABORATORY = 'LABORATORY',
  LIBRARY = 'LIBRARY',
  STATIONERY = 'STATIONERY',
  CLEANING = 'CLEANING',
  UNIFORM = 'UNIFORM',
  OTHER = 'OTHER',
}

export enum ItemCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED',
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  ISSUE = 'ISSUE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  DISPOSAL = 'DISPOSAL',
  ADJUSTMENT = 'ADJUSTMENT',
}

export interface InventoryItem {
  _id: string;
  tenantId?: string;
  name: string;
  description?: string;
  category: ItemCategory;
  sku?: string;
  barcode?: string;
  quantity: number;
  minQuantity: number;
  unit?: string;
  location?: string;
  supplier?: string;
  unitPrice?: number;
  condition: ItemCondition;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
  createdBy?: { _id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  _id: string;
  tenantId?: string;
  itemId: InventoryItem;
  type: TransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  issuedTo?: { _id: string; firstName: string; lastName: string };
  issuedToName?: string;
  returnDate?: string;
  performedBy?: { _id: string; firstName: string; lastName: string };
  notes?: string;
  createdAt: string;
}

export interface LibraryBook {
  _id: string;
  tenantId?: string;
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  genre?: string;
  subject?: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  condition: ItemCondition;
  createdAt: string;
  updatedAt: string;
}

export interface BookIssue {
  _id: string;
  tenantId?: string;
  bookId: LibraryBook;
  borrowerId: { _id: string; firstName: string; lastName: string; email?: string };
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  finePaid: boolean;
  notes?: string;
  issuedBy?: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface InventoryStatistics {
  totalItems: number;
  lowStockItems: number;
  totalBooks: number;
  issuedBooks: number;
  overdueBooks: number;
}

class InventoryService {
  private baseUrl = '/inventory';

  // Inventory Items
  async createItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await apiClient.post<InventoryItem>(`${this.baseUrl}/items`, data);
    return response.data;
  }

  async getAllItems(category?: ItemCategory): Promise<InventoryItem[]> {
    const url = category ? `${this.baseUrl}/items?category=${category}` : `${this.baseUrl}/items`;
    const response = await apiClient.get<InventoryItem[]>(url);
    return response.data;
  }

  async getItemById(id: string): Promise<InventoryItem> {
    const response = await apiClient.get<InventoryItem>(`${this.baseUrl}/items/${id}`);
    return response.data;
  }

  async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await apiClient.put<InventoryItem>(`${this.baseUrl}/items/${id}`, data);
    return response.data;
  }

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/items/${id}`);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const response = await apiClient.get<InventoryItem[]>(`${this.baseUrl}/items/low-stock`);
    return response.data;
  }

  // Transactions
  async createTransaction(data: {
    itemId: string;
    type: TransactionType;
    quantity: number;
    reason?: string;
    issuedTo?: string;
    issuedToName?: string;
    notes?: string;
  }): Promise<InventoryTransaction> {
    const response = await apiClient.post<InventoryTransaction>(`${this.baseUrl}/transactions`, data);
    return response.data;
  }

  async getItemTransactions(itemId: string): Promise<InventoryTransaction[]> {
    const response = await apiClient.get<InventoryTransaction[]>(`${this.baseUrl}/items/${itemId}/transactions`);
    return response.data;
  }

  // Library Books
  async createBook(data: Partial<LibraryBook>): Promise<LibraryBook> {
    const response = await apiClient.post<LibraryBook>(`${this.baseUrl}/library/books`, data);
    return response.data;
  }

  async getAllBooks(search?: string): Promise<LibraryBook[]> {
    const url = search ? `${this.baseUrl}/library/books?search=${search}` : `${this.baseUrl}/library/books`;
    const response = await apiClient.get<LibraryBook[]>(url);
    return response.data;
  }

  async getBookById(id: string): Promise<LibraryBook> {
    const response = await apiClient.get<LibraryBook>(`${this.baseUrl}/library/books/${id}`);
    return response.data;
  }

  async updateBook(id: string, data: Partial<LibraryBook>): Promise<LibraryBook> {
    const response = await apiClient.put<LibraryBook>(`${this.baseUrl}/library/books/${id}`, data);
    return response.data;
  }

  async issueBook(data: { bookId: string; borrowerId: string; dueDate: string; notes?: string }): Promise<BookIssue> {
    const response = await apiClient.post<BookIssue>(`${this.baseUrl}/library/issue`, data);
    return response.data;
  }

  async returnBook(issueId: string, data: { fineAmount?: number; notes?: string }): Promise<BookIssue> {
    const response = await apiClient.post<BookIssue>(`${this.baseUrl}/library/return/${issueId}`, data);
    return response.data;
  }

  async getBorrowerHistory(borrowerId: string): Promise<BookIssue[]> {
    const response = await apiClient.get<BookIssue[]>(`${this.baseUrl}/library/borrower/${borrowerId}`);
    return response.data;
  }

  async getOverdueBooks(): Promise<BookIssue[]> {
    const response = await apiClient.get<BookIssue[]>(`${this.baseUrl}/library/books/overdue`);
    return response.data;
  }

  // Statistics
  async getStatistics(): Promise<InventoryStatistics> {
    const response = await apiClient.get<InventoryStatistics>(`${this.baseUrl}/statistics`);
    return response.data;
  }
}

export const inventoryService = new InventoryService();
