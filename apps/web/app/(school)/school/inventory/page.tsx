'use client';

import { useState, useEffect } from 'react';
import {
  inventoryService,
  InventoryItem,
  LibraryBook,
  InventoryStatistics,
  ItemCategory,
  ItemCondition,
  TransactionType,
} from '../../../../lib/services/inventory.service';
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
  XCircle,
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
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast, Pagination } from '../../../../components/school';

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
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [stats, setStats] = useState<InventoryStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'library'>('items');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | ''>('');

  // Modal states
  const [showItemFormModal, setShowItemFormModal] = useState(false);
  const [showBookFormModal, setShowBookFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [itemFormData, setItemFormData] = useState<ItemFormData>(initialItemForm);
  const [bookFormData, setBookFormData] = useState<BookFormData>(initialBookForm);
  const [submitting, setSubmitting] = useState(false);

  // Detail/manage modals
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueFormData, setIssueFormData] = useState({ borrowerId: '', dueDate: '', notes: '' });

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {},
  });

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
    setShowItemFormModal(true);
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemFormData.name || !itemFormData.category || !itemFormData.quantity || !itemFormData.condition) {
      showToast('error', 'Please fill in all required fields');
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
        showToast('success', 'Item updated successfully');
      } else {
        await inventoryService.createItem(payload);
        showToast('success', 'Item created successfully');
      }

      setShowItemFormModal(false);
      resetItemForm();
      await loadData();
    } catch (err) {
      console.error('Failed to save item:', err);
      showToast('error', 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteItem(item: InventoryItem) {
    setConfirmModal({
      open: true,
      title: 'Delete Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await inventoryService.deleteItem(item._id);
          showToast('success', 'Item deleted successfully');
          await loadData();
        } catch (err) {
          console.error('Failed to delete item:', err);
          showToast('error', 'Failed to delete item');
        }
        setConfirmModal(prev => ({ ...prev, open: false }));
      },
    });
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
    setShowBookFormModal(true);
  }

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookFormData.title || !bookFormData.totalCopies) {
      showToast('error', 'Please fill in all required fields');
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
        showToast('success', 'Book updated successfully');
      } else {
        await inventoryService.createBook(payload);
        showToast('success', 'Book added successfully');
      }

      setShowBookFormModal(false);
      resetBookForm();
      await loadData();
    } catch (err) {
      console.error('Failed to save book:', err);
      showToast('error', 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  }

  function handleIssueBook(book: LibraryBook) {
    setSelectedBook(book);
    setIssueFormData({ borrowerId: '', dueDate: '', notes: '' });
    setShowIssueModal(true);
  }

  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBook || !issueFormData.borrowerId || !issueFormData.dueDate) {
      showToast('error', 'Please fill in all required fields');
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
      showToast('success', 'Book issued successfully');
      setShowIssueModal(false);
      setSelectedBook(null);
      await loadData();
    } catch (err) {
      console.error('Failed to issue book:', err);
      showToast('error', 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  }

  const categoryColors: Record<ItemCategory, string> = {
    [ItemCategory.FURNITURE]: 'bg-amber-100 text-amber-700',
    [ItemCategory.ELECTRONICS]: 'bg-blue-100 text-blue-700',
    [ItemCategory.SPORTS]: 'bg-green-100 text-green-700',
    [ItemCategory.LABORATORY]: 'bg-purple-100 text-purple-700',
    [ItemCategory.LIBRARY]: 'bg-indigo-100 text-indigo-700',
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

  // Compute stat values
  const totalItems = stats?.totalItems ?? items.length;
  const inStockItems = items.filter(i => i.quantity > i.minQuantity).length;
  const lowStockItems = stats?.lowStockItems ?? items.filter(i => i.quantity <= i.minQuantity && i.quantity > 0).length;
  const outOfStockItems = items.filter(i => i.quantity === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
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
      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            if (activeTab === 'items') {
              resetItemForm();
              setShowItemFormModal(true);
            } else {
              resetBookForm();
              setShowBookFormModal(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'items' ? 'Add Item' : 'Add Book'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<Package className="w-5 h-5" />}
          color="blue"
          label="Total Items"
          value={totalItems}
        />
        <SchoolStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          label="In Stock"
          value={inStockItems}
        />
        <SchoolStatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
          label="Low Stock"
          value={lowStockItems}
          subtitle={lowStockItems > 0 ? 'Needs attention' : undefined}
        />
        <SchoolStatCard
          icon={<XCircle className="w-5 h-5" />}
          color="red"
          label="Out of Stock"
          value={outOfStockItems}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'items'
              ? 'border-[#824ef2] text-[#824ef2]'
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
              ? 'border-[#824ef2] text-[#824ef2]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Library
        </button>
      </div>

      {/* Category Filter */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | '')}
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-colors"
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
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {activeTab === 'items' ? (
          items.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto w-16 h-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No inventory items found</h3>
              <p className="mt-2 text-sm text-slate-500">Get started by adding your first item.</p>
              <div className="mt-6">
                <button
                  onClick={() => { resetItemForm(); setShowItemFormModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" /> Add First Item
                </button>
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
                  {items.map((item) => {
                    const stockStatus = item.quantity === 0 ? 'out_of_stock' : item.quantity <= item.minQuantity ? 'low_stock' : 'in_stock';
                    return (
                      <tr key={item._id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-900">{item.name}</div>
                          {item.sku && <div className="text-xs text-slate-500 font-mono">SKU: {item.sku}</div>}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors[item.category]}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className={item.quantity <= item.minQuantity ? 'text-red-600 font-semibold' : 'text-slate-900'}>
                              {item.quantity} {item.unit || 'pcs'}
                            </span>
                            {stockStatus !== 'in_stock' && (
                              <SchoolStatusBadge value={stockStatus} showDot={false} />
                            )}
                          </div>
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
                          ) : '-'}
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
                    );
                  })}
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
                <button
                  onClick={() => { resetBookForm(); setShowBookFormModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" /> Add First Book
                </button>
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
                    <tr key={book._id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">{book.title}</div>
                        {book.genre && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Tag className="w-3 h-3" />
                            {book.genre}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600">{book.author || '-'}</td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-500">{book.isbn || '-'}</td>
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
                        ) : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {book.availableCopies > 0 && (
                            <button
                              onClick={() => handleIssueBook(book)}
                              className="px-3 py-1.5 text-xs font-medium bg-[#824ef2]/10 text-[#824ef2] rounded-lg hover:bg-[#824ef2]/20 transition-colors flex items-center gap-1"
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

      {/* Item Form Modal */}
      <FormModal
        open={showItemFormModal}
        onClose={() => { setShowItemFormModal(false); resetItemForm(); }}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setShowItemFormModal(false); resetItemForm(); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="item-form"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </>
        }
      >
        <form id="item-form" onSubmit={handleItemSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name <span className="text-red-500">*</span></label>
                <input type="text" value={itemFormData.name} onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="Enter item name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select value={itemFormData.category} onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value as ItemCategory })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all appearance-none" required>
                  <option value="">Select Category</option>
                  {Object.values(ItemCategory).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition <span className="text-red-500">*</span></label>
                <select value={itemFormData.condition} onChange={(e) => setItemFormData({ ...itemFormData, condition: e.target.value as ItemCondition })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all appearance-none" required>
                  <option value="">Select Condition</option>
                  {Object.values(ItemCondition).map((cond) => (<option key={cond} value={cond}>{cond}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Box className="w-4 h-4" /> Quantity & Stock
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                <input type="number" value={itemFormData.quantity} onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value ? Number(e.target.value) : '' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" min="0" placeholder="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min Quantity (Alert)</label>
                <input type="number" value={itemFormData.minQuantity} onChange={(e) => setItemFormData({ ...itemFormData, minQuantity: e.target.value ? Number(e.target.value) : '' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" min="0" placeholder="5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                <input type="text" value={itemFormData.unit} onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="pcs, kg, boxes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input type="text" value={itemFormData.sku} onChange={(e) => setItemFormData({ ...itemFormData, sku: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="SKU-001" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location & Supplier
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input type="text" value={itemFormData.location} onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="Storage room, Lab A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                <input type="text" value={itemFormData.supplier} onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="Supplier name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
                <input type="number" value={itemFormData.unitPrice} onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: e.target.value ? Number(e.target.value) : '' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" min="0" step="0.01" placeholder="0.00" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={itemFormData.description} onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all resize-none" rows={2} placeholder="Enter item description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={itemFormData.notes} onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all resize-none" rows={2} placeholder="Additional notes..." />
              </div>
            </div>
          </div>
        </form>
      </FormModal>

      {/* Book Form Modal */}
      <FormModal
        open={showBookFormModal}
        onClose={() => { setShowBookFormModal(false); resetBookForm(); }}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => { setShowBookFormModal(false); resetBookForm(); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" form="book-form" disabled={submitting} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingBook ? 'Update Book' : 'Add Book'}
            </button>
          </>
        }
      >
        <form id="book-form" onSubmit={handleBookSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><BookMarked className="w-4 h-4" /> Book Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" value={bookFormData.title} onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="Enter book title" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                <input type="text" value={bookFormData.author} onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="Author name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ISBN</label>
                <input type="text" value={bookFormData.isbn} onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="ISBN number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Copies <span className="text-red-500">*</span></label>
                <input type="number" value={bookFormData.totalCopies} onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: e.target.value ? Number(e.target.value) : '' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" min="1" placeholder="1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input type="text" value={bookFormData.location} onChange={(e) => setBookFormData({ ...bookFormData, location: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="Shelf A, Section 3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Genre</label>
                <input type="text" value={bookFormData.genre} onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="Fiction, Science" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input type="text" value={bookFormData.subject} onChange={(e) => setBookFormData({ ...bookFormData, subject: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all" placeholder="Math, Physics" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                <select value={bookFormData.condition} onChange={(e) => setBookFormData({ ...bookFormData, condition: e.target.value as ItemCondition })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all appearance-none">
                  {Object.values(ItemCondition).map((cond) => (<option key={cond} value={cond}>{cond}</option>))}
                </select>
              </div>
            </div>
          </div>
        </form>
      </FormModal>

      {/* Item Details Modal */}
      <FormModal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Item Details"
        size="md"
        footer={
          <>
            <button onClick={() => setSelectedItem(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
            <button
              onClick={() => { if (selectedItem) { handleEditItem(selectedItem); setSelectedItem(null); } }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 text-lg">{selectedItem.name}</h3>
            {selectedItem.description && <p className="text-sm text-slate-600">{selectedItem.description}</p>}
            <div className="space-y-3">
              {[
                { label: 'Category', value: <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors[selectedItem.category]}`}>{selectedItem.category}</span> },
                { label: 'Condition', value: <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${conditionColors[selectedItem.condition]}`}>{selectedItem.condition}</span> },
                { label: 'Quantity', value: `${selectedItem.quantity} ${selectedItem.unit || 'pcs'}` },
                { label: 'Min Quantity', value: selectedItem.minQuantity },
                ...(selectedItem.sku ? [{ label: 'SKU', value: selectedItem.sku }] : []),
                ...(selectedItem.location ? [{ label: 'Location', value: selectedItem.location }] : []),
                ...(selectedItem.supplier ? [{ label: 'Supplier', value: selectedItem.supplier }] : []),
                ...(selectedItem.unitPrice ? [{ label: 'Unit Price', value: `$${selectedItem.unitPrice}` }] : []),
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className="text-sm font-medium text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
            {selectedItem.notes && (
              <div className="pt-2">
                <span className="text-sm font-medium text-slate-700">Notes:</span>
                <p className="text-sm text-slate-600 mt-1.5 p-3 bg-slate-50 rounded-lg">{selectedItem.notes}</p>
              </div>
            )}
          </div>
        )}
      </FormModal>

      {/* Issue Book Modal */}
      <FormModal
        open={showIssueModal}
        onClose={() => { setShowIssueModal(false); setSelectedBook(null); }}
        title="Issue Book"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => { setShowIssueModal(false); setSelectedBook(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" form="issue-book-form" disabled={submitting} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Issuing...</> : 'Issue Book'}
            </button>
          </>
        }
      >
        {selectedBook && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-900">{selectedBook.title}</p>
            <p className="text-xs text-slate-500">{selectedBook.author}</p>
          </div>
        )}
        <form id="issue-book-form" onSubmit={handleIssueSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Borrower ID <span className="text-red-500">*</span></label>
            <input type="text" value={issueFormData.borrowerId} onChange={(e) => setIssueFormData({ ...issueFormData, borrowerId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-colors" placeholder="Enter student/staff ID" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input type="date" value={issueFormData.dueDate} onChange={(e) => setIssueFormData({ ...issueFormData, dueDate: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={issueFormData.notes} onChange={(e) => setIssueFormData({ ...issueFormData, notes: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-colors resize-none" rows={2} placeholder="Optional notes..." />
          </div>
        </form>
      </FormModal>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </section>
  );
}
