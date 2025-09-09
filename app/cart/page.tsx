'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import ProcessedProductImage from '@/components/ProcessedProductImage';
import { EmptyStates } from '@/components/EmptyState';
import { useConfirmation } from '@/components/ConfirmationDialog';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { confirm, ConfirmationDialog } = useConfirmation();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
    },
  ]);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });

  // Debug: Log cart items to see what data we have
  console.log('Cart items:', items);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(id);
    updateQuantity(id, newQuantity);
    setTimeout(() => setIsUpdating(null), 300);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddresses((prev) =>
      prev.map((addr, index) =>
        index === selectedAddressIndex ? { ...addr, [field]: value } : addr
      )
    );
  };

  const handleNewAddressChange = (field: string, value: string) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAddress = () => {
    setIsEditingAddress(false);
    console.log('Address saved:', addresses[selectedAddressIndex]);
  };

  const handleSaveNewAddress = () => {
    const newId = Math.max(...addresses.map((addr) => addr.id)) + 1;
    const addressToAdd = { ...newAddress, id: newId };
    setAddresses((prev) => [...prev, addressToAdd]);
    setSelectedAddressIndex(addresses.length); // Select the new address
    setNewAddress({
      firstName: '',
      lastName: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
    });
    setIsAddingNewAddress(false);
    console.log('New address added:', addressToAdd);
  };

  const handleCancelEdit = () => {
    setIsEditingAddress(false);
  };

  const handleCancelNewAddress = () => {
    setIsAddingNewAddress(false);
    setNewAddress({
      firstName: '',
      lastName: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
    });
  };

  const handleDeleteAddress = (addressId: number) => {
    if (addresses.length > 1) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      if (selectedAddressIndex >= addresses.length - 1) {
        setSelectedAddressIndex(Math.max(0, addresses.length - 2));
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <EmptyStates.Cart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            You have {items.length} item{items.length !== 1 ? 's' : ''} in your
            cart
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
                      <div
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg sm:mr-4 overflow-hidden relative flex-shrink-0 flex items-center justify-center cart-image-container"
                        style={{
                          aspectRatio: '1',
                          minWidth: '80px',
                          minHeight: '80px',
                          maxWidth: '96px',
                          maxHeight: '96px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        {item.image && item.image.trim() !== '' ? (
                          <ProcessedProductImage
                            src={
                              item.image.startsWith('data:')
                                ? item.image
                                : `data:image/jpeg;base64,${item.image}`
                            }
                            alt={item.name}
                            className="cart-image"
                            aggressive={true}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center',
                              display: 'block',
                              backgroundColor: 'transparent',
                              padding: '4px',
                              maxWidth: '100%',
                              maxHeight: '100%',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                            }}
                            fallbackClassName="w-full h-full"
                            onError={() => {
                              // Handle error if needed
                            }}
                          />
                        ) : null}
                        <div
                          className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs"
                          style={{
                            display:
                              item.image && item.image.trim() !== ''
                                ? 'none'
                                : 'flex',
                          }}
                        >
                          <span className="text-gray-500 text-xs">No Img</span>
                        </div>
                      </div>

                      <div className="flex-1 w-full sm:w-auto">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                          {item.name || 'Unknown Product'}
                        </h3>
                        <p className="text-gray-700 text-sm sm:text-base">
                          ${item.price.toFixed(2)}
                        </p>
                        {item.stockCount !== undefined && (
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs text-gray-900">
                              Stock: {item.stockCount} available
                            </p>
                            {item.quantity >= item.stockCount && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Max stock reached
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-900 hidden sm:block">
                          ID: {item.id}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={isUpdating === item.id}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 text-gray-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[3rem] text-gray-900 font-medium min-h-[44px] flex items-center justify-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={
                              isUpdating === item.id ||
                              (item.stockCount !== undefined &&
                                item.quantity >= item.stockCount)
                            }
                            className={`p-2 hover:bg-gray-100 disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                              item.stockCount !== undefined &&
                              item.quantity >= item.stockCount
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-900'
                            }`}
                            title={
                              item.stockCount !== undefined &&
                              item.quantity >= item.stockCount
                                ? `Only ${item.stockCount} items available in stock`
                                : 'Increase quantity'
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-center sm:text-right">
                          <p className="text-base sm:text-lg font-semibold text-gray-800">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-center">
                  <button
                    onClick={() => confirm({
                      title: 'Clear Cart',
                      message: 'Are you sure you want to remove all items from your cart? This action cannot be undone.',
                      onConfirm: clearCart,
                      confirmText: 'Clear Cart',
                      type: 'danger'
                    })}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium text-gray-800">
                    ${getTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-medium text-gray-800">
                    {getTotal() >= 50 ? 'Free' : '$5.99'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax</span>
                  <span className="font-medium text-gray-800">
                    ${(getTotal() * 0.08).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      $
                      {(
                        getTotal() +
                        (getTotal() >= 50 ? 0 : 5.99) +
                        getTotal() * 0.08
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address Information */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  {!isEditingAddress && !isAddingNewAddress ? (
                    <>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-900 font-medium">
                          {addresses[selectedAddressIndex]?.firstName}{' '}
                          {addresses[selectedAddressIndex]?.lastName}
                        </p>
                        <p className="text-gray-700">
                          {addresses[selectedAddressIndex]?.street}
                        </p>
                        {addresses[selectedAddressIndex]?.apartment && (
                          <p className="text-gray-700">
                            {addresses[selectedAddressIndex]?.apartment}
                          </p>
                        )}
                        <p className="text-gray-700">
                          {addresses[selectedAddressIndex]?.city},{' '}
                          {addresses[selectedAddressIndex]?.state}{' '}
                          {addresses[selectedAddressIndex]?.zipCode}
                        </p>
                        <p className="text-gray-700">
                          {addresses[selectedAddressIndex]?.country}
                        </p>
                        <p className="text-gray-700">
                          {addresses[selectedAddressIndex]?.phone}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setIsEditingAddress(true)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Edit Address
                        </button>
                        <button
                          onClick={() => setIsAddingNewAddress(true)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          Add New Address
                        </button>
                        {addresses.length > 1 && (
                          <button
                            onClick={() =>
                              handleDeleteAddress(
                                addresses[selectedAddressIndex]?.id || 0
                              )
                            }
                            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      {addresses.length > 1 && (
                        <div className="mt-3">
                          <label className="text-xs text-gray-600 font-medium">
                            Select Address:
                          </label>
                          <select
                            value={selectedAddressIndex}
                            onChange={(e) =>
                              setSelectedAddressIndex(Number(e.target.value))
                            }
                            className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {addresses.map((addr, index) => (
                              <option key={addr.id} value={index}>
                                {addr.firstName} {addr.lastName} - {addr.city},{' '}
                                {addr.state}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  ) : isEditingAddress ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={
                            addresses[selectedAddressIndex]?.firstName || ''
                          }
                          onChange={(e) =>
                            handleAddressChange('firstName', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={
                            addresses[selectedAddressIndex]?.lastName || ''
                          }
                          onChange={(e) =>
                            handleAddressChange('lastName', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={addresses[selectedAddressIndex]?.street || ''}
                        onChange={(e) =>
                          handleAddressChange('street', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Apartment, suite, etc. (optional)"
                        value={addresses[selectedAddressIndex]?.apartment || ''}
                        onChange={(e) =>
                          handleAddressChange('apartment', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={addresses[selectedAddressIndex]?.city || ''}
                          onChange={(e) =>
                            handleAddressChange('city', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={addresses[selectedAddressIndex]?.state || ''}
                          onChange={(e) =>
                            handleAddressChange('state', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={addresses[selectedAddressIndex]?.zipCode || ''}
                          onChange={(e) =>
                            handleAddressChange('zipCode', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Country"
                        value={addresses[selectedAddressIndex]?.country || ''}
                        onChange={(e) =>
                          handleAddressChange('country', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={addresses[selectedAddressIndex]?.phone || ''}
                        onChange={(e) =>
                          handleAddressChange('phone', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveAddress}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Add New Address
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={newAddress.firstName}
                          onChange={(e) =>
                            handleNewAddressChange('firstName', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={newAddress.lastName}
                          onChange={(e) =>
                            handleNewAddressChange('lastName', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newAddress.street}
                        onChange={(e) =>
                          handleNewAddressChange('street', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Apartment, suite, etc. (optional)"
                        value={newAddress.apartment}
                        onChange={(e) =>
                          handleNewAddressChange('apartment', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) =>
                            handleNewAddressChange('city', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) =>
                            handleNewAddressChange('state', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={newAddress.zipCode}
                          onChange={(e) =>
                            handleNewAddressChange('zipCode', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Country"
                        value={newAddress.country}
                        onChange={(e) =>
                          handleNewAddressChange('country', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newAddress.phone}
                        onChange={(e) =>
                          handleNewAddressChange('phone', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveNewAddress}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Add Address
                        </button>
                        <button
                          onClick={handleCancelNewAddress}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 text-center block flex items-center relative"
                >
                  <span className="flex-1">Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 absolute right-4" />
                </Link>
                <Link
                  href="/shop"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>

              {getTotal() < 50 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Add ${(50 - getTotal()).toFixed(2)} more to get free
                    shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog />
    </div>
  );
}
