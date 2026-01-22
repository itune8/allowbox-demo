'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  inventoryService,
  InventoryItem,
  LibraryBook,
  InventoryStatistics,
  ItemCategory,
  ItemCondition,
  TransactionType,
} from '../../../../lib/services/inventory.service';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  Package,
  Plus,
  X,
  Filter,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
  Box,
  Library,
  ArrowRightLeft,
  Layers,
  Hash,
  Barcode,
  Scale,
  Truck,
  DollarSign,
  Calendar,
  Shield,
  FileText,
  StickyNote,
  User,
  CalendarClock,
  BookMarked,
  Building,
  Loader2,
} from 'lucide-react';

interface ItemFormData {
  name: string;
  description: string;
  category: ItemCategory | '';
  sku: string;
  barcode: string;
  quantity: number | '';
  minQuantity: number | '';
  unit: string;
  location: string;
  supplier: string;
  unitPrice: number | '';
  condition: ItemCondition | '';
  purchaseDate: string;
  warrantyExpiry: string;
  notes: string;
}

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishYear: number | '';
  genre: string;
  subject: string;
  totalCopies: number | '';
  location: string;
  condition: ItemCondition | '';
}

const initialItemForm: ItemFormData = {
  name: '',
  description: '',
  category: '',
  sku: '',
  barcode: '',
  quantity: '',
  minQuantity: 5,
  unit: 'pcs',
  location: '',
  supplier: '',
  unitPrice: '',
  condition: ItemCondition.NEW,
  purchaseDate: '',
  warrantyExpiry: '',
  notes: '',
};

const initialBookForm: BookFormData = {
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  publishYear: '',
  genre: '',
  subject: '',
  totalCopies: 1,
  location: '',
  condition: ItemCondition.NEW,
};

export default function SchoolInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [stats, setStats] = useState<InventoryStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'library'>('items');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | ''>('');

  // Sheet states
  const [showItemFormSheet, setShowItemFormSheet] = useState(false);
  const [showBookFormSheet, setShowBookFormSheet] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [itemFormData, setItemFormData] = useState<ItemFormData>(initialItemForm);
  const [bookFormData, setBookFormData] = useState<BookFormData>(initialBookForm);
  const [submitting, setSubmitting] = useState(false);

  // Detail/manage sheets
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [showIssueSheet, setShowIssueSheet] = useState(false);
  const [issueFormData, setIssueFormData] = useState({ borrowerId: '', dueDate: '', notes: '' });

  useEffect(() => {
    loadData();
  }, [activeTab, categoryFilter]);

  async function loadData() {
    try {
      setLoading(true);
      if (activeTab === 'items') {
        const [itemsData, statsData] = await Promise.all([
          inventoryService.getAllItems(categoryFilter || undefined),
          inventoryService.getStatistics(),
        ]);
        setItems(itemsData);
        setStats(statsData);
      } else {
        const [booksData, statsData] = await Promise.all([
          inventoryService.getAllBooks(),
          inventoryService.getStatistics(),
        ]);
        setBooks(booksData);
        setStats(statsData);
      }
    } catch (err) {
      setError('Failed to load inventory data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Item handlers
  function resetItemForm() {
    setItemFormData(initialItemForm);
    setEditingItem(null);
  }

  function handleEditItem(item: InventoryItem) {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      sku: item.sku || '',
      barcode: item.barcode || '',
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit || 'pcs',
      location: item.location || '',
      supplier: item.supplier || '',
      unitPrice: item.unitPrice || '',
      condition: item.condition,
      purchaseDate: item.purchaseDate ? (item.purchaseDate.split('T')[0] ?? '') : '',
      warrantyExpiry: item.warrantyExpiry ? (item.warrantyExpiry.split('T')[0] ?? '') : '',
      notes: item.notes || '',
    });
    setShowItemFormSheet(true);
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemFormData.name || !itemFormData.category || !itemFormData.quantity || !itemFormData.condition) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: itemFormData.name,
        description: itemFormData.description || undefined,
        category: itemFormData.category as ItemCategory,
        sku: itemFormData.sku || undefined,
        barcode: itemFormData.barcode || undefined,
        quantity: Number(itemFormData.quantity),
        minQuantity: Number(itemFormData.minQuantity) || 5,
        unit: itemFormData.unit || 'pcs',
        location: itemFormData.location || undefined,
        supplier: itemFormData.supplier || undefined,
        unitPrice: itemFormData.unitPrice ? Number(itemFormData.unitPrice) : undefined,
        condition: itemFormData.condition as ItemCondition,
        purchaseDate: itemFormData.purchaseDate || undefined,
        warrantyExpiry: itemFormData.warrantyExpiry || undefined,
        notes: itemFormData.notes || undefined,
      };

      if (editingItem) {
        await inventoryService.updateItem(editingItem._id, payload);
        setBanner('Item updated successfully');
      } else {
        await inventoryService.createItem(payload);
        setBanner('Item created successfully');
      }

      setTimeout(() => setBanner(null), 3000);
      setShowItemFormSheet(false);
      resetItemForm();
      await loadData();
    } catch (err) {
      console.error('Failed to save item:', err);
      setError('Failed to save item');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteItem(item: InventoryItem) {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      await inventoryService.deleteItem(item._id);
      setBanner('Item deleted successfully');
      setTimeout(() => setBanner(null), 3000);
      await loadData();
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Failed to delete item');
    }
  }

  // Book handlers
  function resetBookForm() {
    setBookFormData(initialBookForm);
    setEditingBook(null);
  }

  function handleEditBook(book: LibraryBook) {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      author: book.author || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publishYear: book.publishYear || '',
      genre: book.genre || '',
      subject: book.subject || '',
      totalCopies: book.totalCopies,
      location: book.location || '',
      condition: book.condition,
    });
    setShowBookFormSheet(true);
  }

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookFormData.title || !bookFormData.totalCopies) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: bookFormData.title,
        author: bookFormData.author || undefined,
        isbn: bookFormData.isbn || undefined,
        publisher: bookFormData.publisher || undefined,
        publishYear: bookFormData.publishYear ? Number(bookFormData.publishYear) : undefined,
        genre: bookFormData.genre || undefined,
        subject: bookFormData.subject || undefined,
        totalCopies: Number(bookFormData.totalCopies),
        availableCopies: editingBook ? undefined : Number(bookFormData.totalCopies),
        location: bookFormData.location || undefined,
        condition: (bookFormData.condition as ItemCondition) || ItemCondition.GOOD,
      };

      if (editingBook) {
        await inventoryService.updateBook(editingBook._id, payload);
        setBanner('Book updated successfully');
      } else {
        await inventoryService.createBook(payload);
        setBanner('Book added successfully');
      }

      setTimeout(() => setBanner(null), 3000);
      setShowBookFormSheet(false);
      resetBookForm();
      await loadData();
    } catch (err) {
      console.error('Failed to save book:', err);
      setError('Failed to save book');
    } finally {
      setSubmitting(false);
    }
  }

  function handleIssueBook(book: LibraryBook) {
    setSelectedBook(book);
    setIssueFormData({ borrowerId: '', dueDate: '', notes: '' });
    setShowIssueSheet(true);
  }

  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBook || !issueFormData.borrowerId || !issueFormData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.issueBook({
        bookId: selectedBook._id,
        borrowerId: issueFormData.borrowerId,
        dueDate: issueFormData.dueDate,
        notes: issueFormData.notes || undefined,
      });
      setBanner('Book issued successfully');
      setTimeout(() => setBanner(null), 3000);
      setShowIssueSheet(false);
      setSelectedBook(null);
      await loadData();
    } catch (err) {
      console.error('Failed to issue book:', err);
      setError('Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  }

  const categoryColors: Record<ItemCategory, string> = {
    [ItemCategory.FURNITURE]: 'bg-amber-100 text-amber-700',
    [ItemCategory.ELECTRONICS]: 'bg-blue-100 text-blue-700',
    [ItemCategory.SPORTS]: 'bg-green-100 text-green-700',
    [ItemCategory.LABORATORY]: 'bg-purple-100 text-purple-700',
    [ItemCategory.LIBRARY]: 'bg-primary-100 text-primary-dark',
    [ItemCategory.STATIONERY]: 'bg-pink-100 text-pink-700',
    [ItemCategory.CLEANING]: 'bg-cyan-100 text-cyan-700',
    [ItemCategory.UNIFORM]: 'bg-orange-100 text-orange-700',
    [ItemCategory.OTHER]: 'bg-gray-100 text-gray-700',
  };

  const conditionColors: Record<ItemCondition, string> = {
    [ItemCondition.NEW]: 'bg-emerald-100 text-emerald-700',
    [ItemCondition.GOOD]: 'bg-blue-100 text-blue-700',
    [ItemCondition.FAIR]: 'bg-amber-100 text-amber-700',
    [ItemCondition.POOR]: 'bg-orange-100 text-orange-700',
    [ItemCondition.DAMAGED]: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Success Banner */}
      {banner && (
        <div className="bg-white rounded-xl border border-emerald-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-emerald-800 font-medium">{banner}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-white rounded-xl border border-red-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-sm text-slate-500">Track school assets, supplies, and library books</p>
          </div>
        </div>
        <Button
          onClick={() => {
            if (activeTab === 'items') {
              resetItemForm();
              setShowItemFormSheet(true);
            } else {
              resetBookForm();
              setShowBookFormSheet(true);
            }
          }}
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'items' ? 'Add Item' : 'Add Book'}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Box className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Items</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Low Stock</p>
                <p className="text-2xl font-bold text-slate-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Library className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Library Books</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalBooks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Books Issued</p>
                <p className="text-2xl font-bold text-slate-900">{stats.issuedBooks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Overdue Books</p>
                <p className="text-2xl font-bold text-slate-900">{stats.overdueBooks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'items'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Inventory Items
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'library'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Library
        </button>
      </div>

      {/* Category Filter */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | '')}
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            >
              <option value="">All Categories</option>
              {Object.values(ItemCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'items' ? (
          items.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto w-16 h-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No inventory items found</h3>
              <p className="mt-2 text-sm text-slate-500">Get started by adding your first item.</p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    resetItemForm();
                    setShowItemFormSheet(true);
                  }}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="py-4 px-4 font-semibold text-slate-700">Item</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Category</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Quantity</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Condition</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Location</th>
                    <th className="py-4 px-4 font-semibold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">
                          {item.name}
                        </div>
                        {item.sku && <div className="text-xs text-slate-500 font-mono">SKU: {item.sku}</div>}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors[item.category]}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={item.quantity <= item.minQuantity ? 'text-red-600 font-semibold' : 'text-slate-900'}>
                          {item.quantity} {item.unit || 'pcs'}
                        </span>
                        {item.quantity <= item.minQuantity && (
                          <span className="ml-2 px-2 py-0.5 rounded-lg text-xs font-medium bg-red-100 text-red-600">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${conditionColors[item.condition]}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {item.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {item.location}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          books.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto w-16 h-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No books in library</h3>
              <p className="mt-2 text-sm text-slate-500">Get started by adding your first book.</p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    resetBookForm();
                    setShowBookFormSheet(true);
                  }}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Book
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="py-4 px-4 font-semibold text-slate-700">Book</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Author</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">ISBN</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Available</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Location</th>
                    <th className="py-4 px-4 font-semibold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map((book) => (
                    <tr
                      key={book._id}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">
                          {book.title}
                        </div>
                        {book.genre && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Tag className="w-3 h-3" />
                            {book.genre}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {book.author || '-'}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-500">
                        {book.isbn || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          book.availableCopies === 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {book.availableCopies}/{book.totalCopies}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {book.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {book.location}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {book.availableCopies > 0 && (
                            <button
                              onClick={() => handleIssueBook(book)}
                              className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              Issue
                            </button>
                          )}
                          <button
                            onClick={() => handleEditBook(book)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Item Form Sheet */}
      <SlideSheet
        isOpen={showItemFormSheet}
        onClose={() => {
          setShowItemFormSheet(false);
          resetItemForm();
        }}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        subtitle={editingItem ? 'Update inventory item details' : 'Add a new item to inventory'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowItemFormSheet(false);
                resetItemForm();
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="item-form"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingItem ? 'Update Item' : 'Add Item'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="item-form" onSubmit={handleItemSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <SheetSection title="Basic Information" icon={<Package className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <SheetField
                  label="Item Name"
                  required
                  icon={<Tag className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Enter item name"
                    required
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Category"
                  required
                  icon={<Layers className="w-4 h-4 text-slate-400" />}
                >
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value as ItemCategory })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.values(ItemCategory).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Condition"
                  required
                  icon={<Shield className="w-4 h-4 text-slate-400" />}
                >
                  <select
                    value={itemFormData.condition}
                    onChange={(e) => setItemFormData({ ...itemFormData, condition: e.target.value as ItemCondition })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none"
                    required
                  >
                    <option value="">Select Condition</option>
                    {Object.values(ItemCondition).map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </SheetField>
              </div>
            </div>
          </SheetSection>

          {/* Quantity & Stock Section */}
          <SheetSection title="Quantity & Stock" icon={<Box className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SheetField
                  label="Quantity"
                  required
                  icon={<Hash className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="number"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    min="0"
                    placeholder="0"
                    required
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Min Quantity (Alert)"
                  icon={<AlertTriangle className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="number"
                    value={itemFormData.minQuantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, minQuantity: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    min="0"
                    placeholder="5"
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Unit"
                  icon={<Scale className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="pcs, kg, boxes, etc."
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="SKU"
                  icon={<Barcode className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={itemFormData.sku}
                    onChange={(e) => setItemFormData({ ...itemFormData, sku: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="SKU-001"
                  />
                </SheetField>
              </div>
            </div>
          </SheetSection>

          {/* Location & Supplier Section */}
          <SheetSection title="Location & Supplier" icon={<MapPin className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SheetField
                  label="Location"
                  icon={<MapPin className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={itemFormData.location}
                    onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Storage room, Lab A, etc."
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Supplier"
                  icon={<Truck className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={itemFormData.supplier}
                    onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Supplier name"
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Unit Price"
                  icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="number"
                    value={itemFormData.unitPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </SheetField>
              </div>
            </div>
          </SheetSection>

          {/* Dates Section */}
          <SheetSection title="Dates" icon={<Calendar className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SheetField
                  label="Purchase Date"
                  icon={<Calendar className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="date"
                    value={itemFormData.purchaseDate}
                    onChange={(e) => setItemFormData({ ...itemFormData, purchaseDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Warranty Expiry"
                  icon={<Shield className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="date"
                    value={itemFormData.warrantyExpiry}
                    onChange={(e) => setItemFormData({ ...itemFormData, warrantyExpiry: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </SheetField>
              </div>
            </div>
          </SheetSection>

          {/* Additional Information Section */}
          <SheetSection title="Additional Information" icon={<FileText className="w-4 h-4" />}>
            <div className="space-y-4">
              <div>
                <SheetField
                  label="Description"
                  icon={<FileText className="w-4 h-4 text-slate-400" />}
                >
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                    rows={2}
                    placeholder="Enter item description..."
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Notes"
                  icon={<StickyNote className="w-4 h-4 text-slate-400" />}
                >
                  <textarea
                    value={itemFormData.notes}
                    onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </SheetField>
              </div>
            </div>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Book Form Sheet */}
      <SlideSheet
        isOpen={showBookFormSheet}
        onClose={() => {
          setShowBookFormSheet(false);
          resetBookForm();
        }}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
        subtitle={editingBook ? 'Update book details' : 'Add a new book to library'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowBookFormSheet(false);
                resetBookForm();
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="book-form"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingBook ? 'Update Book' : 'Add Book'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="book-form" onSubmit={handleBookSubmit} className="space-y-6">
          {/* Book Details Section */}
          <SheetSection title="Book Details" icon={<BookMarked className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <SheetField
                  label="Title"
                  required
                  icon={<BookOpen className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Enter book title"
                    required
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Author"
                  icon={<User className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Author name"
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="ISBN"
                  icon={<Barcode className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={bookFormData.isbn}
                    onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="ISBN number"
                  />
                </SheetField>
              </div>
            </div>
          </SheetSection>

          {/* Publisher Information Section */}
          <SheetSection title="Publisher Information" icon={<Building className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SheetField
                  label="Publisher"
                  icon={<Building className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={bookFormData.publisher}
                    onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Publisher name"
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Publish Year"
                  icon={<Calendar className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="number"
                    value={bookFormData.publishYear}
                    onChange={(e) => setBookFormData({ ...bookFormData, publishYear: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    min="1900"
                    max="2099"
                    placeholder="Year"
                  />
                </SheetField>
              </div>
            </div>
          </SheetSection>

          {/* Classification Section */}
          <SheetSection title="Classification" icon={<Tag className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SheetField
                  label="Genre"
                  icon={<Layers className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={bookFormData.genre}
                    onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Fiction, Science, History, etc."
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Subject"
                  icon={<FileText className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={bookFormData.subject}
                    onChange={(e) => setBookFormData({ ...bookFormData, subject: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Math, Physics, Literature, etc."
                  />
                </SheetField>
              </div>
            </div>
          </SheetSection>

          {/* Inventory Section */}
          <SheetSection title="Inventory" icon={<Library className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SheetField
                  label="Total Copies"
                  required
                  icon={<Hash className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="number"
                    value={bookFormData.totalCopies}
                    onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    min="1"
                    placeholder="1"
                    required
                  />
                </SheetField>
              </div>
              <div>
                <SheetField
                  label="Location"
                  icon={<MapPin className="w-4 h-4 text-slate-400" />}
                >
                  <input
                    type="text"
                    value={bookFormData.location}
                    onChange={(e) => setBookFormData({ ...bookFormData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Shelf A, Section 3, etc."
                  />
                </SheetField>
              </div>
              <div className="col-span-2">
                <SheetField
                  label="Condition"
                  icon={<Shield className="w-4 h-4 text-slate-400" />}
                >
                  <select
                    value={bookFormData.condition}
                    onChange={(e) => setBookFormData({ ...bookFormData, condition: e.target.value as ItemCondition })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none"
                  >
                    {Object.values(ItemCondition).map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </SheetField>
              </div>
            </div>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Item Details Sheet */}
      <SlideSheet
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Item Details"
        subtitle={selectedItem?.name}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedItem) {
                  handleEditItem(selectedItem);
                  setSelectedItem(null);
                }
              }}
              className="bg-primary hover:bg-primary-dark"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            {selectedItem.description && (
              <p className="text-sm text-slate-600">{selectedItem.description}</p>
            )}

            <div className="space-y-2">
              <SheetDetailRow label="Category">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors[selectedItem.category]}`}>
                  {selectedItem.category}
                </span>
              </SheetDetailRow>
              <SheetDetailRow label="Condition">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${conditionColors[selectedItem.condition]}`}>
                  {selectedItem.condition}
                </span>
              </SheetDetailRow>
              <SheetDetailRow label="Quantity">
                {selectedItem.quantity} {selectedItem.unit || 'pcs'}
              </SheetDetailRow>
              <SheetDetailRow label="Min Quantity">
                {selectedItem.minQuantity}
              </SheetDetailRow>
              {selectedItem.sku && (
                <SheetDetailRow label="SKU">
                  {selectedItem.sku}
                </SheetDetailRow>
              )}
              {selectedItem.location && (
                <SheetDetailRow label="Location">
                  {selectedItem.location}
                </SheetDetailRow>
              )}
              {selectedItem.supplier && (
                <SheetDetailRow label="Supplier">
                  {selectedItem.supplier}
                </SheetDetailRow>
              )}
              {selectedItem.unitPrice && (
                <SheetDetailRow label="Unit Price">
                  ${selectedItem.unitPrice}
                </SheetDetailRow>
              )}
            </div>

            {selectedItem.notes && (
              <div className="pt-2">
                <span className="text-sm font-medium text-slate-700">Notes:</span>
                <p className="text-sm text-slate-600 mt-1.5 p-3 bg-slate-50 rounded-lg">{selectedItem.notes}</p>
              </div>
            )}
          </div>
        )}
      </SlideSheet>

      {/* Issue Book Sheet */}
      <SlideSheet
        isOpen={showIssueSheet}
        onClose={() => {
          setShowIssueSheet(false);
          setSelectedBook(null);
        }}
        title="Issue Book"
        subtitle={selectedBook?.title ? `"${selectedBook.title}"` : ''}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowIssueSheet(false);
                setSelectedBook(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="issue-book-form"
              disabled={submitting}
              className="bg-primary hover:bg-primary-dark"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Issuing...
                </>
              ) : (
                'Issue Book'
              )}
            </Button>
          </div>
        }
      >
        <form id="issue-book-form" onSubmit={handleIssueSubmit} className="space-y-4">
          <div>
            <SheetField label="Borrower ID" required>
              <input
                type="text"
                value={issueFormData.borrowerId}
                onChange={(e) => setIssueFormData({ ...issueFormData, borrowerId: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Enter student/staff ID"
                required
              />
            </SheetField>
          </div>
          <div>
            <SheetField label="Due Date" required>
              <input
                type="date"
                value={issueFormData.dueDate}
                onChange={(e) => setIssueFormData({ ...issueFormData, dueDate: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                required
              />
            </SheetField>
          </div>
          <div>
            <SheetField label="Notes">
              <textarea
                value={issueFormData.notes}
                onChange={(e) => setIssueFormData({ ...issueFormData, notes: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                rows={2}
                placeholder="Optional notes..."
              />
            </SheetField>
          </div>
        </form>
      </SlideSheet>
    </section>
  );
}
