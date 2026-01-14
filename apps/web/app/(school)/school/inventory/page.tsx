'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import { Portal } from '../../../../components/portal';
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
  Sparkles,
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

  // Form states
  const [showItemForm, setShowItemForm] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
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
    setShowItemForm(true);
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
      setShowItemForm(false);
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
    setShowBookForm(true);
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
      setShowBookForm(false);
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
    setShowIssueModal(true);
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
      setShowIssueModal(false);
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
    [ItemCategory.LIBRARY]: 'bg-indigo-100 text-indigo-700',
    [ItemCategory.STATIONERY]: 'bg-pink-100 text-pink-700',
    [ItemCategory.CLEANING]: 'bg-cyan-100 text-cyan-700',
    [ItemCategory.UNIFORM]: 'bg-orange-100 text-orange-700',
    [ItemCategory.OTHER]: 'bg-gray-100 text-gray-700',
  };

  const conditionColors: Record<ItemCondition, string> = {
    [ItemCondition.NEW]: 'bg-green-100 text-green-700',
    [ItemCondition.GOOD]: 'bg-blue-100 text-blue-700',
    [ItemCondition.FAIR]: 'bg-yellow-100 text-yellow-700',
    [ItemCondition.POOR]: 'bg-orange-100 text-orange-700',
    [ItemCondition.DAMAGED]: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-strong rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-green-800 font-medium">{banner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 text-red-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-cyan-500 to-teal-500" size="lg">
            <Package className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-sm text-gray-500">Track school assets, supplies, and library books</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => {
              if (activeTab === 'items') {
                resetItemForm();
                setShowItemForm(true);
              } else {
                resetBookForm();
                setShowBookForm(true);
              }
            }}
            className="shadow-lg shadow-cyan-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'items' ? 'Add Item' : 'Add Book'}
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AnimatedStatCard
            title="Total Items"
            value={stats.totalItems}
            icon={<Box className="w-5 h-5 text-cyan-600" />}
            iconBgColor="bg-cyan-100"
            delay={0}
          />
          <AnimatedStatCard
            title="Low Stock"
            value={stats.lowStockItems}
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            iconBgColor="bg-red-100"
            delay={1}
          />
          <AnimatedStatCard
            title="Library Books"
            value={stats.totalBooks}
            icon={<Library className="w-5 h-5 text-indigo-600" />}
            iconBgColor="bg-indigo-100"
            delay={2}
          />
          <AnimatedStatCard
            title="Books Issued"
            value={stats.issuedBooks}
            icon={<ArrowRightLeft className="w-5 h-5 text-yellow-600" />}
            iconBgColor="bg-yellow-100"
            delay={3}
          />
          <AnimatedStatCard
            title="Overdue Books"
            value={stats.overdueBooks}
            icon={<Clock className="w-5 h-5 text-orange-600" />}
            iconBgColor="bg-orange-100"
            delay={4}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'items'
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Inventory Items
        </motion.button>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'library'
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Library
        </motion.button>
      </div>

      {/* Category Filter */}
      {activeTab === 'items' && (
        <GlassCard hover={false} className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | '')}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white/80 text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 transition-all"
            >
              <option value="">All Categories</option>
              {Object.values(ItemCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </GlassCard>
      )}

      {/* Content */}
      <GlassCard hover={false} className="overflow-hidden">
        {activeTab === 'items' ? (
          items.length === 0 ? (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Package className="mx-auto w-16 h-16 text-gray-300" />
              </motion.div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No inventory items found</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by adding your first item.</p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    resetItemForm();
                    setShowItemForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                  <tr className="text-left">
                    <th className="py-4 px-4 font-semibold text-gray-700">Item</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Category</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Condition</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Location</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                      className="group transition-all"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">
                          {item.name}
                        </div>
                        {item.sku && <div className="text-xs text-gray-500 font-mono">SKU: {item.sku}</div>}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors[item.category]}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={item.quantity <= item.minQuantity ? 'text-red-600 font-semibold' : 'text-gray-900'}>
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
                      <td className="py-4 px-4 text-gray-600">
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
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedItem(item)}
                            className="p-2 rounded-lg hover:bg-cyan-100 text-gray-400 hover:text-cyan-600 transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditItem(item)}
                            className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          books.length === 0 ? (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <BookOpen className="mx-auto w-16 h-16 text-gray-300" />
              </motion.div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No books in library</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by adding your first book.</p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    resetBookForm();
                    setShowBookForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Book
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                  <tr className="text-left">
                    <th className="py-4 px-4 font-semibold text-gray-700">Book</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Author</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">ISBN</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Available</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Location</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {books.map((book, index) => (
                    <motion.tr
                      key={book._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                      className="group transition-all"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">
                          {book.title}
                        </div>
                        {book.genre && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Tag className="w-3 h-3" />
                            {book.genre}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {book.author || '-'}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-gray-500">
                        {book.isbn || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          book.availableCopies === 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {book.availableCopies}/{book.totalCopies}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
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
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleIssueBook(book)}
                              className="px-3 py-1.5 text-xs font-medium bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors flex items-center gap-1"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              Issue
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditBook(book)}
                            className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </GlassCard>

      {/* Item Form Modal */}
      <AnimatePresence>
        {showItemForm && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-start justify-center overflow-y-auto pt-8 pb-8"
              onClick={() => {
                setShowItemForm(false);
                resetItemForm();
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-2xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glass morphism container */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                  {/* Gradient Header */}
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                    <motion.div
                      className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <div className="relative px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                          className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30"
                          style={{ transform: 'perspective(100px) rotateX(5deg)' }}
                        >
                          <Package className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold text-white"
                          >
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-white/80"
                          >
                            {editingItem ? 'Update inventory item details' : 'Add a new item to inventory'}
                          </motion.p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setShowItemForm(false);
                          resetItemForm();
                        }}
                        className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors border border-white/30"
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </div>

                  <form onSubmit={handleItemSubmit} className="p-6 space-y-6">
                    {/* Basic Information Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-cyan-500 to-teal-500" size="sm">
                          <Package className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Item Name *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Tag className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={itemFormData.name}
                              onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Enter item name"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Category *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Layers className="w-4 h-4 text-gray-400" />
                            </div>
                            <select
                              value={itemFormData.category}
                              onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value as ItemCategory })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all appearance-none shadow-sm"
                              required
                            >
                              <option value="">Select Category</option>
                              {Object.values(ItemCategory).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Condition *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Shield className="w-4 h-4 text-gray-400" />
                            </div>
                            <select
                              value={itemFormData.condition}
                              onChange={(e) => setItemFormData({ ...itemFormData, condition: e.target.value as ItemCondition })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all appearance-none shadow-sm"
                              required
                            >
                              <option value="">Select Condition</option>
                              {Object.values(ItemCondition).map((cond) => (
                                <option key={cond} value={cond}>{cond}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Quantity & Stock Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-emerald-500 to-green-500" size="sm">
                          <Box className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quantity & Stock</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Quantity *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Hash className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={itemFormData.quantity}
                              onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value ? Number(e.target.value) : '' })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                              min="0"
                              placeholder="0"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Min Quantity (Alert)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <AlertTriangle className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={itemFormData.minQuantity}
                              onChange={(e) => setItemFormData({ ...itemFormData, minQuantity: e.target.value ? Number(e.target.value) : '' })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                              min="0"
                              placeholder="5"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Unit
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Scale className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={itemFormData.unit}
                              onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                              placeholder="pcs, kg, boxes, etc."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            SKU
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Barcode className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={itemFormData.sku}
                              onChange={(e) => setItemFormData({ ...itemFormData, sku: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                              placeholder="SKU-001"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Location & Supplier Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-blue-500 to-indigo-500" size="sm">
                          <MapPin className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Location & Supplier</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Location
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <MapPin className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={itemFormData.location}
                              onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Storage room, Lab A, etc."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Supplier
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Truck className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={itemFormData.supplier}
                              onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Supplier name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Unit Price
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={itemFormData.unitPrice}
                              onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: e.target.value ? Number(e.target.value) : '' })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Dates Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-purple-500 to-pink-500" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dates</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Purchase Date
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              value={itemFormData.purchaseDate}
                              onChange={(e) => setItemFormData({ ...itemFormData, purchaseDate: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Warranty Expiry
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Shield className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              value={itemFormData.warrantyExpiry}
                              onChange={(e) => setItemFormData({ ...itemFormData, warrantyExpiry: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Additional Information Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                          <FileText className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Additional Information</h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description
                          </label>
                          <div className="relative">
                            <div className="absolute top-3 left-3.5 pointer-events-none">
                              <FileText className="w-4 h-4 text-gray-400" />
                            </div>
                            <textarea
                              value={itemFormData.description}
                              onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all resize-none shadow-sm"
                              rows={2}
                              placeholder="Enter item description..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Notes
                          </label>
                          <div className="relative">
                            <div className="absolute top-3 left-3.5 pointer-events-none">
                              <StickyNote className="w-4 h-4 text-gray-400" />
                            </div>
                            <textarea
                              value={itemFormData.notes}
                              onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all resize-none shadow-sm"
                              rows={2}
                              placeholder="Additional notes..."
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex justify-end gap-3 pt-6 border-t border-gray-200/80"
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowItemForm(false);
                          resetItemForm();
                        }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px rgba(6, 182, 212, 0.5)' }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {editingItem ? 'Update Item' : 'Add Item'}
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Book Form Modal */}
      <AnimatePresence>
        {showBookForm && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-start justify-center overflow-y-auto pt-8 pb-8"
              onClick={() => {
                setShowBookForm(false);
                resetBookForm();
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-2xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glass morphism container */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                  {/* Gradient Header */}
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                    <motion.div
                      className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <div className="relative px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                          className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30"
                          style={{ transform: 'perspective(100px) rotateX(5deg)' }}
                        >
                          <BookOpen className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold text-white"
                          >
                            {editingBook ? 'Edit Book' : 'Add New Book'}
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-white/80"
                          >
                            {editingBook ? 'Update book details' : 'Add a new book to library'}
                          </motion.p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setShowBookForm(false);
                          resetBookForm();
                        }}
                        className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors border border-white/30"
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </div>

                  <form onSubmit={handleBookSubmit} className="p-6 space-y-6">
                    {/* Book Details Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-indigo-500 to-purple-500" size="sm">
                          <BookMarked className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Book Details</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Title *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={bookFormData.title}
                              onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Enter book title"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Author
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={bookFormData.author}
                              onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Author name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            ISBN
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Barcode className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={bookFormData.isbn}
                              onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              placeholder="ISBN number"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Publisher Information Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                          <Building className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Publisher Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Publisher
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Building className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={bookFormData.publisher}
                              onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Publisher name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Publish Year
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={bookFormData.publishYear}
                              onChange={(e) => setBookFormData({ ...bookFormData, publishYear: e.target.value ? Number(e.target.value) : '' })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              min="1900"
                              max="2099"
                              placeholder="Year"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Classification Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                          <Tag className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Classification</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Genre
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Layers className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={bookFormData.genre}
                              onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Fiction, Science, History, etc."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Subject
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <FileText className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={bookFormData.subject}
                              onChange={(e) => setBookFormData({ ...bookFormData, subject: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Math, Physics, Literature, etc."
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Inventory Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-emerald-500 to-green-500" size="sm">
                          <Library className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Inventory</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Total Copies *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Hash className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={bookFormData.totalCopies}
                              onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: e.target.value ? Number(e.target.value) : '' })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              min="1"
                              placeholder="1"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Location
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <MapPin className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={bookFormData.location}
                              onChange={(e) => setBookFormData({ ...bookFormData, location: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
                              placeholder="Shelf A, Section 3, etc."
                            />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Condition
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Shield className="w-4 h-4 text-gray-400" />
                            </div>
                            <select
                              value={bookFormData.condition}
                              onChange={(e) => setBookFormData({ ...bookFormData, condition: e.target.value as ItemCondition })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm bg-white/60 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all appearance-none shadow-sm"
                            >
                              {Object.values(ItemCondition).map((cond) => (
                                <option key={cond} value={cond}>{cond}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex justify-end gap-3 pt-6 border-t border-gray-200/80"
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowBookForm(false);
                          resetBookForm();
                        }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.5)' }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {editingBook ? 'Update Book' : 'Add Book'}
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Item Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Icon3D gradient="from-cyan-500 to-teal-500" size="md">
                      <Package className="w-5 h-5" />
                    </Icon3D>
                    <h3 className="text-lg font-bold text-gray-900">Item Details</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedItem(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedItem.name}</h4>
                    {selectedItem.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      { label: 'Category', value: selectedItem.category, badge: categoryColors[selectedItem.category] },
                      { label: 'Condition', value: selectedItem.condition, badge: conditionColors[selectedItem.condition] },
                      { label: 'Quantity', value: `${selectedItem.quantity} ${selectedItem.unit || 'pcs'}` },
                      { label: 'Min Qty', value: selectedItem.minQuantity.toString() },
                      ...(selectedItem.sku ? [{ label: 'SKU', value: selectedItem.sku }] : []),
                      ...(selectedItem.location ? [{ label: 'Location', value: selectedItem.location }] : []),
                      ...(selectedItem.supplier ? [{ label: 'Supplier', value: selectedItem.supplier }] : []),
                      ...(selectedItem.unitPrice ? [{ label: 'Unit Price', value: `$${selectedItem.unitPrice}` }] : []),
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between py-2.5 border-b border-gray-100"
                      >
                        <span className="text-gray-500">{item.label}</span>
                        {item.badge ? (
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${item.badge}`}>
                            {item.value}
                          </span>
                        ) : (
                          <span className="font-medium text-gray-900">{item.value}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {selectedItem.notes && (
                    <div className="pt-2">
                      <span className="text-sm text-gray-500">Notes:</span>
                      <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-xl">{selectedItem.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button variant="outline" onClick={() => setSelectedItem(null)}>
                      Close
                    </Button>
                    <Button onClick={() => { handleEditItem(selectedItem); setSelectedItem(null); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Issue Book Modal */}
      <AnimatePresence>
        {showIssueModal && selectedBook && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center"
              onClick={() => {
                setShowIssueModal(false);
                setSelectedBook(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Icon3D gradient="from-green-500 to-emerald-500" size="md">
                      <ArrowRightLeft className="w-5 h-5" />
                    </Icon3D>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Issue Book</h3>
                      <p className="text-sm text-gray-500">"{selectedBook.title}"</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowIssueModal(false);
                      setSelectedBook(null);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                <form onSubmit={handleIssueSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Borrower ID *
                    </label>
                    <input
                      type="text"
                      value={issueFormData.borrowerId}
                      onChange={(e) => setIssueFormData({ ...issueFormData, borrowerId: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white/80 text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
                      placeholder="Enter student/staff ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={issueFormData.dueDate}
                      onChange={(e) => setIssueFormData({ ...issueFormData, dueDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white/80 text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Notes
                    </label>
                    <textarea
                      value={issueFormData.notes}
                      onChange={(e) => setIssueFormData({ ...issueFormData, notes: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white/80 text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowIssueModal(false);
                        setSelectedBook(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Issuing...' : 'Issue Book'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
