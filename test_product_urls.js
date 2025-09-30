// Test product-specific URL generation
const testProducts = [
  {
    _id: '68aef08bad44459caa3fd945',
    name: 'Beam Wallet NFC for Merchants',
    price: 199.99,
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-nfc',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-nfc'
  },
  {
    _id: '68aef08bad44459caa3fd948',
    name: 'Beam Wallet Bluetooth Terminal for Merchants',
    price: 249.99,
    externalUrl: 'https://shop.beamwallet.com/pt/product/bluethoot-terminal-for-physical-stores',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/bluethoot-terminal-for-physical-stores'
  },
  {
    _id: '68aef08bad44459caa3fd94b',
    name: 'Beam Wallet for Online Stores',
    price: 149.99,
    externalUrl: 'https://shop.beamwallet.com/pt/product/for-online-stores',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/for-online-stores'
  }
];

const resellerId = 'F2FA9D';

console.log('Testing product-specific URL generation...\n');

testProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   Price: $${product.price}`);
  console.log(`   External URL: ${product.externalUrl}`);
  
  // Simulate the getDirectStoreUrl function
  const baseUrl = product.externalShopUrl || 'https://shop.beamwallet.com';
  const trackingParams = new URLSearchParams({
    affiliate_id: resellerId,
    product_id: product._id,
    product_price: product.price.toString(),
    utm_source: 'affiliate',
    utm_medium: 'link',
    utm_campaign: 'beam_affiliate',
    ref: 'beam_affiliate_platform'
  });
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  const finalUrl = `${baseUrl}${separator}${trackingParams.toString()}`;
  
  console.log(`   Generated URL: ${finalUrl}`);
  console.log('');
});

console.log('✅ All product URLs generated successfully!');
console.log('\nNow each product will redirect to its specific store page with tracking parameters.');
