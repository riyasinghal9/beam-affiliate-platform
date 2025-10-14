const mongoose = require('mongoose');
const Product = require('../models/Product');

const beamWalletProducts = [
  {
    name: 'Certificate of Quality and Trust',
    description: 'Official quality and trust certification for merchants using Beam Wallet. Enhance customer confidence and credibility.',
    longDescription: 'Professional certification program that validates merchant quality and trustworthiness. This certificate enhances customer confidence and provides official recognition of compliance with Beam Wallet standards.',
    price: 25.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/certificate-of-quality-and-trust',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/certificate-of-quality-and-trust',
    beamWalletProductId: 'certificate-of-quality-and-trust',
    features: [
      'Official Beam Wallet certification',
      'Trust badge for website/store',
      'Enhanced customer confidence',
      'Quality assurance verification',
      'Marketing materials included',
      'Certificate validity tracking',
      'Renewal reminders',
      'Priority customer support'
    ],
    requirements: [
      'Active Beam Wallet merchant account',
      'Compliance with quality standards',
      'Business verification',
      'Customer service standards'
    ],
    tags: ['certificate', 'trust', 'quality', 'verification', 'credibility'],
    sortOrder: 1
  },
  {
    name: 'Beam Wallet NFC',
    description: 'Professional NFC-enabled Beam Wallet solution for physical stores and merchants. Enable contactless payments with advanced security features.',
    longDescription: 'The Beam Wallet NFC solution provides merchants with cutting-edge contactless payment technology. This comprehensive system includes NFC hardware, software integration, and complete setup support for physical stores.',
    price: 75.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-nfc',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-nfc',
    beamWalletProductId: 'beam-wallet-nfc',
    features: [
      'NFC contactless payment technology',
      'Advanced security encryption',
      'Complete hardware setup',
      'Merchant dashboard access',
      'Real-time transaction monitoring',
      'Multi-currency support',
      'Mobile app integration',
      '24/7 technical support'
    ],
    requirements: [
      'Android or iOS device',
      'Internet connection',
      'Valid business registration',
      'Bank account for settlements'
    ],
    tags: ['NFC', 'contactless', 'payments', 'merchants', 'physical-stores'],
    sortOrder: 2
  },
  {
    name: 'For Online Stores',
    description: 'Complete e-commerce payment solution for online stores. Integrate Beam Wallet payments into your website with ease.',
    longDescription: 'Comprehensive e-commerce integration solution that enables online stores to accept Beam Wallet payments. Includes API integration, checkout widgets, and complete payment processing infrastructure.',
    price: 75.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=900&fit=crop&q=90&auto=format&fm=webp',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop&q=90&auto=format&fm=webp',
    externalUrl: 'https://shop.beamwallet.com/pt/product/for-online-stores',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/for-online-stores',
    beamWalletProductId: 'for-online-stores',
    features: [
      'Easy API integration',
      'Customizable checkout widgets',
      'Secure payment processing',
      'Multi-platform support',
      'Real-time transaction tracking',
      'Automated invoicing',
      'Customer management tools',
      'Analytics and reporting'
    ],
    requirements: [
      'Active website or e-commerce platform',
      'Basic technical knowledge',
      'SSL certificate',
      'Business registration'
    ],
    tags: ['e-commerce', 'online-stores', 'API', 'integration', 'checkout'],
    sortOrder: 3
  },
  {
    name: 'Cashback Card',
    description: 'Exclusive Beam Wallet cashback card for customers. Earn rewards on every purchase with our premium cashback program.',
    longDescription: 'Premium cashback card that provides customers with exclusive rewards and benefits. Earn cashback on every purchase while enjoying premium features and exclusive merchant discounts.',
    price: 50.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/cashback-card',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/cashback-card',
    beamWalletProductId: 'cashback-card',
    features: [
      'Exclusive cashback rewards',
      'Premium card design',
      'Worldwide acceptance',
      'Mobile app integration',
      'Transaction notifications',
      'Spending analytics',
      'Fraud protection',
      '24/7 customer support'
    ],
    requirements: [
      'Valid identification',
      'Credit check approval',
      'Minimum age requirement',
      'Residential address verification'
    ],
    tags: ['cashback', 'card', 'rewards', 'premium', 'customer'],
    sortOrder: 4
  },
  {
    name: 'Beam Wallet Pro License',
    description: 'Professional Beam Wallet license for businesses and enterprises. Advanced features and priority support.',
    longDescription: 'Comprehensive professional license that provides businesses with advanced Beam Wallet features, priority customer support, and enterprise-level security. Perfect for companies looking to integrate Beam Wallet into their operations.',
    price: 199.00,
    commission: 50.00, // 50% commission rate
    category: 'License',
    productType: 'license',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-pro-license',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-pro-license',
    beamWalletProductId: 'beam-wallet-pro-license',
    features: [
      'Advanced security features',
      'Priority customer support',
      'Custom branding options',
      'API access',
      'Multi-user management',
      'Advanced analytics',
      'White-label solutions',
      '24/7 technical support'
    ],
    requirements: [
      'Business registration',
      'Valid business email',
      'Minimum 6-month commitment',
      'Technical contact person'
    ],
    tags: ['license', 'pro', 'enterprise', 'business', 'advanced'],
    sortOrder: 5
  },
  {
    name: 'Beam Wallet Mobile App',
    description: 'Premium mobile application for Beam Wallet with advanced features and enhanced user experience.',
    longDescription: 'Feature-rich mobile application that provides users with a comprehensive Beam Wallet experience on their mobile devices. Includes advanced security, biometric authentication, and seamless integration with all Beam Wallet services.',
    price: 29.99,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-mobile-app',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-mobile-app',
    beamWalletProductId: 'beam-wallet-mobile-app',
    features: [
      'Biometric authentication',
      'Real-time notifications',
      'QR code payments',
      'Transaction history',
      'Multi-currency support',
      'Offline mode',
      'Advanced security',
      'User-friendly interface'
    ],
    requirements: [
      'iOS 12+ or Android 8+',
      'Internet connection',
      'Valid email address',
      'Phone number verification'
    ],
    tags: ['mobile', 'app', 'premium', 'security', 'user-friendly'],
    sortOrder: 6
  },
  {
    name: 'Beam Wallet API Access',
    description: 'Developer API access for integrating Beam Wallet services into custom applications and websites.',
    longDescription: 'Comprehensive API access that allows developers to integrate Beam Wallet payment processing, user management, and transaction handling into their custom applications. Includes documentation, SDKs, and developer support.',
    price: 99.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-api-access',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-api-access',
    beamWalletProductId: 'beam-wallet-api-access',
    features: [
      'RESTful API access',
      'SDK for multiple languages',
      'Comprehensive documentation',
      'Sandbox environment',
      'Webhook support',
      'Rate limiting',
      'Developer dashboard',
      'Technical support'
    ],
    requirements: [
      'Developer account',
      'Basic programming knowledge',
      'Valid business registration',
      'Technical documentation review'
    ],
    tags: ['API', 'developer', 'integration', 'SDK', 'documentation'],
    sortOrder: 7
  },
  {
    name: 'Beam Wallet Security Package',
    description: 'Advanced security package with multi-factor authentication, encryption, and fraud protection.',
    longDescription: 'Comprehensive security solution that provides advanced protection for Beam Wallet users. Includes multi-factor authentication, end-to-end encryption, fraud detection, and security monitoring services.',
    price: 149.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-security-package',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-security-package',
    beamWalletProductId: 'beam-wallet-security-package',
    features: [
      'Multi-factor authentication',
      'End-to-end encryption',
      'Fraud detection system',
      'Security monitoring',
      'Biometric authentication',
      'Secure key management',
      'Real-time alerts',
      '24/7 security support'
    ],
    requirements: [
      'Valid Beam Wallet account',
      'Mobile device with biometrics',
      'Secure internet connection',
      'Identity verification'
    ],
    tags: ['security', 'encryption', 'authentication', 'fraud-protection', 'monitoring'],
    sortOrder: 8
  },
  {
    name: 'Beam Wallet Merchant Kit',
    description: 'Complete merchant onboarding kit with setup assistance, training, and marketing materials.',
    longDescription: 'Comprehensive merchant onboarding package that includes complete setup assistance, training sessions, marketing materials, and ongoing support to help merchants successfully integrate and use Beam Wallet services.',
    price: 299.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-merchant-kit',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-merchant-kit',
    beamWalletProductId: 'beam-wallet-merchant-kit',
    features: [
      'Complete setup assistance',
      'Training sessions',
      'Marketing materials',
      'Branded materials',
      'Technical support',
      'Account management',
      'Performance analytics',
      'Ongoing consultation'
    ],
    requirements: [
      'Valid business registration',
      'Bank account for settlements',
      'Technical contact person',
      'Minimum transaction volume'
    ],
    tags: ['merchant', 'onboarding', 'training', 'marketing', 'support'],
    sortOrder: 9
  },
  {
    name: 'Beam Wallet Analytics Dashboard',
    description: 'Advanced analytics and reporting dashboard for tracking transactions, performance, and business insights.',
    longDescription: 'Comprehensive analytics dashboard that provides merchants and businesses with detailed insights into their Beam Wallet transactions, customer behavior, performance metrics, and business intelligence reports.',
    price: 79.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-analytics-dashboard',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-analytics-dashboard',
    beamWalletProductId: 'beam-wallet-analytics-dashboard',
    features: [
      'Real-time transaction tracking',
      'Performance metrics',
      'Customer analytics',
      'Revenue reporting',
      'Custom dashboards',
      'Export capabilities',
      'Automated reports',
      'Data visualization'
    ],
    requirements: [
      'Active Beam Wallet merchant account',
      'Internet connection',
      'Basic computer skills',
      'Data access permissions'
    ],
    tags: ['analytics', 'dashboard', 'reporting', 'metrics', 'insights'],
    sortOrder: 10
  },
  {
    name: 'Beam Wallet Terminal Bluetooth',
    description: 'Terminal Bluetooth profissional para pagamentos móveis. Solução completa para comerciantes que precisam de mobilidade.',
    longDescription: 'Terminal Bluetooth de última geração que permite processar pagamentos em qualquer lugar. Ideal para comerciantes móveis, food trucks, e prestadores de serviços que precisam de mobilidade total.',
    price: 175.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-terminal-bluetooth',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-terminal-bluetooth',
    beamWalletProductId: 'beam-wallet-terminal-bluetooth',
    features: [
      'Conexão Bluetooth estável',
      'Bateria de longa duração',
      'Processamento offline',
      'Integração com aplicativo móvel',
      'Relatórios em tempo real',
      'Suporte a múltiplas moedas',
      'Segurança avançada',
      'Garantia de 2 anos'
    ],
    requirements: [
      'Smartphone ou tablet compatível',
      'Conexão Bluetooth 4.0+',
      'Aplicativo Beam Wallet',
      'Conta de comerciante ativa'
    ],
    tags: ['terminal', 'bluetooth', 'móvel', 'pagamentos', 'comerciante'],
    sortOrder: 11
  },
  {
    name: 'Beam Wallet Terminal NFC',
    description: 'Terminal NFC para pagamentos por aproximação. Tecnologia de ponta para estabelecimentos físicos.',
    longDescription: 'Terminal NFC de alta performance que permite pagamentos por aproximação com cartões e smartphones. Solução ideal para lojas físicas, restaurantes e estabelecimentos comerciais.',
    price: 125.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-terminal-nfc',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-terminal-nfc',
    beamWalletProductId: 'beam-wallet-terminal-nfc',
    features: [
      'Tecnologia NFC avançada',
      'Tela touchscreen colorida',
      'Conectividade WiFi e 4G',
      'Impressão de recibos',
      'Gestão de inventário',
      'Relatórios detalhados',
      'Suporte técnico 24/7',
      'Instalação incluída'
    ],
    requirements: [
      'Conexão à internet',
      'Conta de comerciante verificada',
      'Espaço físico adequado',
      'Treinamento básico'
    ],
    tags: ['terminal', 'NFC', 'físico', 'loja', 'estabelecimento'],
    sortOrder: 12
  },
  {
    name: 'Beam Wallet Gateway de Pagamento',
    description: 'Gateway de pagamento completo para integração em websites e aplicações. Solução técnica avançada.',
    longDescription: 'Gateway de pagamento robusto que permite integração completa em websites, aplicações móveis e sistemas de e-commerce. Inclui APIs, webhooks e documentação completa.',
    price: 299.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-gateway-pagamento',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-gateway-pagamento',
    beamWalletProductId: 'beam-wallet-gateway-pagamento',
    features: [
      'API RESTful completa',
      'Webhooks em tempo real',
      'SDK para múltiplas linguagens',
      'Ambiente de sandbox',
      'Documentação técnica detalhada',
      'Suporte de desenvolvedores',
      'Métricas avançadas',
      'Conformidade PCI DSS'
    ],
    requirements: [
      'Conhecimento técnico avançado',
      'Servidor com SSL',
      'Conta de desenvolvedor',
      'Testes de integração'
    ],
    tags: ['gateway', 'API', 'desenvolvedor', 'integração', 'técnico'],
    sortOrder: 13
  },
  {
    name: 'Beam Wallet White Label',
    description: 'Solução white label completa para empresas que querem sua própria marca. Personalização total.',
    longDescription: 'Solução white label que permite às empresas criar sua própria plataforma de pagamentos com a marca personalizada. Inclui design customizado, domínio próprio e suporte dedicado.',
    price: 999.00,
    commission: 50.00, // 50% commission rate
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-white-label',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-white-label',
    beamWalletProductId: 'beam-wallet-white-label',
    features: [
      'Marca personalizada completa',
      'Domínio próprio',
      'Design customizado',
      'Aplicativo móvel personalizado',
      'Dashboard administrativo',
      'Suporte dedicado 24/7',
      'Treinamento completo',
      'Implementação assistida'
    ],
    requirements: [
      'Empresa registrada',
      'Marca e identidade visual',
      'Domínio próprio',
      'Equipe técnica dedicada'
    ],
    tags: ['white-label', 'personalizado', 'empresa', 'marca', 'customização'],
    sortOrder: 14
  },
  {
    name: 'Beam Wallet Token (BEAM)',
    description: 'Token oficial Beam Wallet para transações e recompensas. Criptomoeda nativa da plataforma.',
    longDescription: 'Token BEAM é a criptomoeda nativa da plataforma Beam Wallet. Usado para transações, recompensas, staking e participação no ecossistema. Tecnologia blockchain avançada.',
    price: 0.50,
    commission: 50.00, // 50% commission rate
    category: 'Token',
    productType: 'token',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-token',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-token',
    beamWalletProductId: 'beam-wallet-token',
    features: [
      'Transações instantâneas',
      'Taxas baixas',
      'Staking e recompensas',
      'Governança da plataforma',
      'Queima de tokens',
      'Segurança blockchain',
      'Interoperabilidade',
      'Ecosistema descentralizado'
    ],
    requirements: [
      'Carteira Beam Wallet',
      'Conhecimento básico de cripto',
      'Verificação de identidade',
      'Compreensão de riscos'
    ],
    tags: ['token', 'criptomoeda', 'blockchain', 'BEAM', 'staking'],
    sortOrder: 15
  },
  {
    name: 'Beam Wallet Instalação Completa',
    description: 'Serviço de instalação e configuração completa para comerciantes. Suporte técnico especializado.',
    longDescription: 'Serviço completo de instalação, configuração e treinamento para comerciantes. Inclui setup de terminais, integração de sistemas, treinamento da equipe e suporte pós-instalação.',
    price: 199.00,
    commission: 50.00, // 50% commission rate
    category: 'Installation',
    productType: 'installation',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-instalacao-completa',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-instalacao-completa',
    beamWalletProductId: 'beam-wallet-instalacao-completa',
    features: [
      'Instalação profissional',
      'Configuração personalizada',
      'Treinamento da equipe',
      'Testes de funcionamento',
      'Documentação técnica',
      'Suporte pós-instalação',
      'Garantia de funcionamento',
      'Consultoria especializada'
    ],
    requirements: [
      'Estabelecimento físico',
      'Conexão à internet',
      'Equipe disponível',
      'Horário agendado'
    ],
    tags: ['instalação', 'configuração', 'treinamento', 'suporte', 'profissional'],
    sortOrder: 16
  }
];

const seedBeamWalletProducts = async () => {
  try {
    console.log('🌱 Starting Beam Wallet product seeding...');
    
    // Clear existing products (optional - remove if you want to keep existing ones)
    // await Product.deleteMany({});
    // console.log('🗑️ Cleared existing products');
    
    // Insert new products
    for (const productData of beamWalletProducts) {
      const existingProduct = await Product.findOne({ 
        beamWalletProductId: productData.beamWalletProductId 
      });
      
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${product.name}`);
      } else {
        // Update existing product with new data
        await Product.findOneAndUpdate(
          { beamWalletProductId: productData.beamWalletProductId },
          productData,
          { new: true }
        );
        console.log(`🔄 Updated product: ${productData.name}`);
      }
    }
    
    console.log('🎉 Beam Wallet product seeding completed successfully!');
    console.log(`📊 Total products: ${beamWalletProducts.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding Beam Wallet products:', error);
    throw error;
  }
};

module.exports = {
  seedBeamWalletProducts,
  beamWalletProducts
}; 