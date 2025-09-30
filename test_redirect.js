// Test redirect URL generation
const testUrl = 'http://localhost:3000/payment?v=199.99&id=test123&product=68aef08bad44459caa3fd945&utm_source=affiliate&utm_medium=link&utm_campaign=beam_affiliate';

console.log('Testing redirect URL generation...');
console.log('Input URL:', testUrl);

// Parse URL parameters
const url = new URL(testUrl);
const params = url.searchParams;

const price = params.get('v');
const resellerId = params.get('id');
const productId = params.get('product');
const utmSource = params.get('utm_source');
const utmMedium = params.get('utm_medium');
const utmCampaign = params.get('utm_campaign');

console.log('Parsed parameters:');
console.log('- Price:', price);
console.log('- Reseller ID:', resellerId);
console.log('- Product ID:', productId);
console.log('- UTM Source:', utmSource);
console.log('- UTM Medium:', utmMedium);
console.log('- UTM Campaign:', utmCampaign);

// Generate store URL
const baseStoreUrl = 'https://shop.beamwallet.com/pt/product/for-online-stores';
const trackingParams = new URLSearchParams({
  affiliate_id: resellerId,
  product_id: productId,
  product_price: price,
  utm_source: utmSource || 'affiliate',
  utm_medium: utmMedium || 'link',
  utm_campaign: utmCampaign || 'beam_affiliate',
  ref: 'beam_affiliate_platform'
});

const finalStoreUrl = `${baseStoreUrl}?${trackingParams.toString()}`;
console.log('\nGenerated store URL:');
console.log(finalStoreUrl);

// Test the URL
console.log('\nTesting URL accessibility...');
fetch(finalStoreUrl, { method: 'HEAD' })
  .then(response => {
    console.log('Store URL status:', response.status);
    if (response.status === 200) {
      console.log('✅ Store URL is accessible');
    } else {
      console.log('⚠️ Store URL returned status:', response.status);
    }
  })
  .catch(error => {
    console.log('❌ Error accessing store URL:', error.message);
  });
