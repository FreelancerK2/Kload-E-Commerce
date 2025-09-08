// Script to fix cart issues and add correct products
console.log('🔧 Fixing cart issues...');

// Clear cart storage
if (typeof window !== 'undefined') {
  localStorage.removeItem('cart-storage');
  console.log('✅ Cart cleared from local storage');
  console.log('');
  console.log('📋 Instructions to add correct products:');
  console.log('1. Go to the Shop page (/shop)');
  console.log('2. Add these products with proper images:');
  console.log(
    '   - Premium Wireless Headphones (ID: premium-wireless-headphones)'
  );
  console.log('   - Smart Watch Pro (ID: smart-watch-pro)');
  console.log('   - Wireless Earbuds (ID: wireless-earbuds)');
  console.log('   - Adjustable Laptop Stand (ID: laptop-stand)');
  console.log('   - Mechanical Gaming Keyboard (ID: mechanical-keyboard)');
  console.log(
    '3. These products have proper base64 images and will display correctly'
  );
  console.log('');
  console.log('🔄 Please refresh the page and add products from the shop');
} else {
  console.log('❌ This script must be run in the browser console');
  console.log('📝 Instructions:');
  console.log('1. Open your browser console (F12)');
  console.log('2. Copy and paste this code:');
  console.log('   localStorage.removeItem("cart-storage");');
  console.log('3. Refresh the page');
  console.log('4. Go to the shop and add the correct products');
}
