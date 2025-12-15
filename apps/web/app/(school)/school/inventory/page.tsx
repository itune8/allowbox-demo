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
      alert('Please fill in all required fields');
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
      } else {
        await inventoryService.createItem(payload);
      }

      setShowItemForm(false);
      resetItemForm();
      await loadData();
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Failed to save item');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteItem(item: InventoryItem) {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      await inventoryService.deleteItem(item._id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item');
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
      alert('Please fill in all required fields');
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
      } else {
        await inventoryService.createBook(payload);
      }

      setShowBookForm(false);
      resetBookForm();
      await loadData();
    } catch (err) {
      console.error('Failed to save book:', err);
      alert('Failed to save book');
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
      alert('Please fill in all required fields');
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
      setShowIssueModal(false);
      setSelectedBook(null);
      await loadData();
    } catch (err) {
      console.error('Failed to issue book:', err);
      alert('Failed to issue book');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track school assets, supplies, and library books
          </p>
        </div>
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
        >
          {activeTab === 'items' ? '+ Add Item' : '+ Add Book'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalItems}</div>
            <div className="text-sm text-gray-500">Total Items</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
            <div className="text-sm text-gray-500">Low Stock</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalBooks}</div>
            <div className="text-sm text-gray-500">Library Books</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.issuedBooks}</div>
            <div className="text-sm text-gray-500">Books Issued</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.overdueBooks}</div>
            <div className="text-sm text-gray-500">Overdue Books</div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'items'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Inventory Items
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'library'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Library
        </button>
      </div>

      {activeTab === 'items' && (
        <div className="flex gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | '')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="">All Categories</option>
            {Object.values(ItemCategory).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {activeTab === 'items' ? (
          items.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">📦</div>
              <p>No inventory items found.</p>
              <Button
                className="mt-4"
                onClick={() => {
                  resetItemForm();
                  setShowItemForm(true);
                }}
              >
                + Add First Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                        {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[item.category]}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={item.quantity <= item.minQuantity ? 'text-red-600 font-medium' : ''}>
                          {item.quantity} {item.unit || 'pcs'}
                        </span>
                        {item.quantity <= item.minQuantity && (
                          <span className="ml-1 text-xs text-red-500">(Low)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${conditionColors[item.condition]}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {item.location || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item)}>
                            Delete
                          </Button>
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
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">📚</div>
              <p>No books in library.</p>
              <Button
                className="mt-4"
                onClick={() => {
                  resetBookForm();
                  setShowBookForm(true);
                }}
              >
                + Add First Book
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="py-3 px-4">Book</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4">Available</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {books.map((book) => (
                    <tr key={book._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{book.title}</div>
                        {book.genre && <div className="text-xs text-gray-500">{book.genre}</div>}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {book.author || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">
                        {book.isbn || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={book.availableCopies === 0 ? 'text-red-600' : 'text-green-600'}>
                          {book.availableCopies}/{book.totalCopies}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {book.location || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {book.availableCopies > 0 && (
                            <Button variant="outline" size="sm" onClick={() => handleIssueBook(book)}>
                              Issue
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleEditBook(book)}>
                            Edit
                          </Button>
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
      {showItemForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
            </div>
            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value as ItemCategory })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.values(ItemCategory).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Condition *
                  </label>
                  <select
                    value={itemFormData.condition}
                    onChange={(e) => setItemFormData({ ...itemFormData, condition: e.target.value as ItemCondition })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="">Select Condition</option>
                    {Object.values(ItemCondition).map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Quantity (Alert)
                  </label>
                  <input
                    type="number"
                    value={itemFormData.minQuantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, minQuantity: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    placeholder="pcs, kg, boxes, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={itemFormData.sku}
                    onChange={(e) => setItemFormData({ ...itemFormData, sku: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={itemFormData.location}
                    onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    placeholder="Storage room, Lab A, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={itemFormData.supplier}
                    onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    value={itemFormData.unitPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={itemFormData.purchaseDate}
                    onChange={(e) => setItemFormData({ ...itemFormData, purchaseDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Warranty Expiry
                  </label>
                  <input
                    type="date"
                    value={itemFormData.warrantyExpiry}
                    onChange={(e) => setItemFormData({ ...itemFormData, warrantyExpiry: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={itemFormData.notes}
                    onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowItemForm(false);
                    resetItemForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Form Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
            </div>
            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={bookFormData.isbn}
                    onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={bookFormData.publisher}
                    onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publish Year
                  </label>
                  <input
                    type="number"
                    value={bookFormData.publishYear}
                    onChange={(e) => setBookFormData({ ...bookFormData, publishYear: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    min="1900"
                    max="2099"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={bookFormData.genre}
                    onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    placeholder="Fiction, Science, History, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={bookFormData.subject}
                    onChange={(e) => setBookFormData({ ...bookFormData, subject: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    placeholder="Math, Physics, Literature, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    value={bookFormData.totalCopies}
                    onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={bookFormData.location}
                    onChange={(e) => setBookFormData({ ...bookFormData, location: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    placeholder="Shelf A, Section 3, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Condition
                  </label>
                  <select
                    value={bookFormData.condition}
                    onChange={(e) => setBookFormData({ ...bookFormData, condition: e.target.value as ItemCondition })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  >
                    {Object.values(ItemCondition).map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBookForm(false);
                    resetBookForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Item Details</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedItem.name}</h3>
                {selectedItem.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedItem.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${categoryColors[selectedItem.category]}`}>
                    {selectedItem.category}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Condition:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${conditionColors[selectedItem.condition]}`}>
                    {selectedItem.condition}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Quantity:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {selectedItem.quantity} {selectedItem.unit || 'pcs'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Min Qty:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedItem.minQuantity}</span>
                </div>
                {selectedItem.sku && (
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedItem.sku}</span>
                  </div>
                )}
                {selectedItem.location && (
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedItem.location}</span>
                  </div>
                )}
                {selectedItem.supplier && (
                  <div>
                    <span className="text-gray-500">Supplier:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedItem.supplier}</span>
                  </div>
                )}
                {selectedItem.unitPrice && (
                  <div>
                    <span className="text-gray-500">Unit Price:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">${selectedItem.unitPrice}</span>
                  </div>
                )}
              </div>
              {selectedItem.notes && (
                <div>
                  <span className="text-sm text-gray-500">Notes:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selectedItem.notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
                <Button onClick={() => { handleEditItem(selectedItem); setSelectedItem(null); }}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Issue Book</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">"{selectedBook.title}"</p>
            </div>
            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Borrower ID *
                </label>
                <input
                  type="text"
                  value={issueFormData.borrowerId}
                  onChange={(e) => setIssueFormData({ ...issueFormData, borrowerId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  placeholder="Enter student/staff ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={issueFormData.dueDate}
                  onChange={(e) => setIssueFormData({ ...issueFormData, dueDate: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={issueFormData.notes}
                  onChange={(e) => setIssueFormData({ ...issueFormData, notes: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
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
          </div>
        </div>
      )}
    </div>
  );
}
