// Script to clear the cart from browser local storage
console.log('🧹 Clearing cart from local storage...');

// Clear cart storage
if (typeof window !== 'undefined') {
  localStorage.removeItem('cart-storage');
  console.log('✅ Cart cleared from local storage');
  console.log('🔄 Please refresh the page and add products from the shop');
} else {
  console.log('❌ This script must be run in the browser console');
  console.log('📝 Instructions:');
  console.log('1. Open your browser console (F12)');
  console.log('2. Copy and paste this code:');
  console.log('   localStorage.removeItem("cart-storage");');
  console.log('3. Refresh the page');
  console.log('4. Go to the shop and add products');
}
