const i18next = require('i18next');

class InternationalizationService {
  constructor() {
    this.supportedLanguages = {
      en: { name: 'English', flag: '🇺🇸', rtl: false },
      es: { name: 'Español', flag: '🇪🇸', rtl: false },
      fr: { name: 'Français', flag: '🇫🇷', rtl: false },
      de: { name: 'Deutsch', flag: '🇩🇪', rtl: false },
      pt: { name: 'Português', flag: '🇵🇹', rtl: false },
      it: { name: 'Italiano', flag: '🇮🇹', rtl: false },
      ru: { name: 'Русский', flag: '🇷🇺', rtl: false },
      zh: { name: '中文', flag: '🇨🇳', rtl: false },
      ja: { name: '日本語', flag: '🇯🇵', rtl: false },
      ko: { name: '한국어', flag: '🇰🇷', rtl: false },
      ar: { name: 'العربية', flag: '🇸🇦', rtl: true },
      hi: { name: 'हिन्दी', flag: '🇮🇳', rtl: false }
    };

    this.translations = {
      en: this.getEnglishTranslations(),
      es: this.getSpanishTranslations(),
      fr: this.getFrenchTranslations(),
      de: this.getGermanTranslations(),
      pt: this.getPortugueseTranslations(),
      it: this.getItalianTranslations(),
      ru: this.getRussianTranslations(),
      zh: this.getChineseTranslations(),
      ja: this.getJapaneseTranslations(),
      ko: this.getKoreanTranslations(),
      ar: this.getArabicTranslations(),
      hi: this.getHindiTranslations()
    };

    this.initializeI18n();
  }

  async initializeI18n() {
    await i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      debug: false,
      resources: this.translations,
      interpolation: {
        escapeValue: false
      }
    });
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Get current language
  getCurrentLanguage() {
    return i18next.language;
  }

  // Change language
  async changeLanguage(language) {
    if (!this.supportedLanguages[language]) {
      throw new Error(`Language ${language} is not supported`);
    }

    await i18next.changeLanguage(language);
    return { success: true, language: language };
  }

  // Translate text
  translate(key, options = {}) {
    return i18next.t(key, options);
  }

  // Get translations for a specific language
  getTranslations(language) {
    return this.translations[language] || this.translations.en;
  }

  // Add custom translation
  addTranslation(language, namespace, key, value) {
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    if (!this.translations[language][namespace]) {
      this.translations[language][namespace] = {};
    }
    this.translations[language][namespace][key] = value;
  }

  // Get language direction (LTR/RTL)
  getLanguageDirection(language) {
    return this.supportedLanguages[language]?.rtl ? 'rtl' : 'ltr';
  }

  // Format currency based on locale
  formatCurrency(amount, currency = 'USD', locale = 'en') {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount);
  }

  // Format date based on locale
  formatDate(date, locale = 'en') {
    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return formatter.format(new Date(date));
  }

  // Format number based on locale
  formatNumber(number, locale = 'en') {
    const formatter = new Intl.NumberFormat(locale);
    return formatter.format(number);
  }

  // Translation methods for each language
  getEnglishTranslations() {
    return {
      translation: {
        // Navigation
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        products: 'Products',
        commissions: 'Commissions',
        payments: 'Payments',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout',

        // Dashboard
        welcome: 'Welcome back',
        totalEarnings: 'Total Earnings',
        totalSales: 'Total Sales',
        activeProducts: 'Active Products',
        pendingCommissions: 'Pending Commissions',
        recentActivity: 'Recent Activity',
        performanceChart: 'Performance Chart',

        // Analytics
        overview: 'Overview',
        salesAnalytics: 'Sales Analytics',
        clickAnalytics: 'Click Analytics',
        conversionRate: 'Conversion Rate',
        revenueGrowth: 'Revenue Growth',
        topProducts: 'Top Products',
        geographicData: 'Geographic Data',

        // Products
        availableProducts: 'Available Products',
        commissionRate: 'Commission Rate',
        productDescription: 'Product Description',
        getLink: 'Get Link',
        copyLink: 'Copy Link',
        viewDetails: 'View Details',

        // Commissions
        commissionHistory: 'Commission History',
        pendingAmount: 'Pending Amount',
        approvedAmount: 'Approved Amount',
        paidAmount: 'Paid Amount',
        commissionStatus: 'Commission Status',

        // Payments
        paymentHistory: 'Payment History',
        withdrawFunds: 'Withdraw Funds',
        paymentMethod: 'Payment Method!!!',
        amount: 'Amount',
        status: 'Status',
        date: 'Date',

        // Profile
        personalInfo: 'Personal Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        resellerId: 'Reseller ID',
        level: 'Level',
        balance: 'Balance',

        // Common
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information'
      }
    };
  }

  getSpanishTranslations() {
    return {
      translation: {
        dashboard: 'Panel de Control',
        analytics: 'Análisis',
        products: 'Productos',
        commissions: 'Comisiones',
        payments: 'Pagos',
        profile: 'Perfil',
        settings: 'Configuración',
        logout: 'Cerrar Sesión',
        welcome: 'Bienvenido de vuelta',
        totalEarnings: 'Ganancias Totales',
        totalSales: 'Ventas Totales',
        activeProducts: 'Productos Activos',
        pendingCommissions: 'Comisiones Pendientes',
        recentActivity: 'Actividad Reciente',
        performanceChart: 'Gráfico de Rendimiento'
      }
    };
  }

  getFrenchTranslations() {
    return {
      translation: {
        dashboard: 'Tableau de Bord',
        analytics: 'Analyses',
        products: 'Produits',
        commissions: 'Commissions',
        payments: 'Paiements',
        profile: 'Profil',
        settings: 'Paramètres',
        logout: 'Déconnexion',
        welcome: 'Bon retour',
        totalEarnings: 'Gains Totaux',
        totalSales: 'Ventes Totales',
        activeProducts: 'Produits Actifs',
        pendingCommissions: 'Commissions en Attente',
        recentActivity: 'Activité Récente',
        performanceChart: 'Graphique de Performance'
      }
    };
  }

  getGermanTranslations() {
    return {
      translation: {
        dashboard: 'Dashboard',
        analytics: 'Analysen',
        products: 'Produkte',
        commissions: 'Provisionen',
        payments: 'Zahlungen',
        profile: 'Profil',
        settings: 'Einstellungen',
        logout: 'Abmelden',
        welcome: 'Willkommen zurück',
        totalEarnings: 'Gesamteinnahmen',
        totalSales: 'Gesamtverkäufe',
        activeProducts: 'Aktive Produkte',
        pendingCommissions: 'Ausstehende Provisionen',
        recentActivity: 'Letzte Aktivität',
        performanceChart: 'Leistungsdiagramm'
      }
    };
  }

  getPortugueseTranslations() {
    return {
      translation: {
        dashboard: 'Painel de Controle',
        analytics: 'Análises',
        products: 'Produtos',
        commissions: 'Comissões',
        payments: 'Pagamentos',
        profile: 'Perfil',
        settings: 'Configurações',
        logout: 'Sair',
        welcome: 'Bem-vindo de volta',
        totalEarnings: 'Ganhos Totais',
        totalSales: 'Vendas Totais',
        activeProducts: 'Produtos Ativos',
        pendingCommissions: 'Comissões Pendentes',
        recentActivity: 'Atividade Recente',
        performanceChart: 'Gráfico de Performance'
      }
    };
  }

  getItalianTranslations() {
    return {
      translation: {
        dashboard: 'Dashboard',
        analytics: 'Analisi',
        products: 'Prodotti',
        commissions: 'Commissioni',
        payments: 'Pagamenti',
        profile: 'Profilo',
        settings: 'Impostazioni',
        logout: 'Disconnetti',
        welcome: 'Bentornato',
        totalEarnings: 'Guadagni Totali',
        totalSales: 'Vendite Totali',
        activeProducts: 'Prodotti Attivi',
        pendingCommissions: 'Commissioni in Sospeso',
        recentActivity: 'Attività Recente',
        performanceChart: 'Grafico delle Prestazioni'
      }
    };
  }

  getRussianTranslations() {
    return {
      translation: {
        dashboard: 'Панель управления',
        analytics: 'Аналитика',
        products: 'Продукты',
        commissions: 'Комиссии',
        payments: 'Платежи',
        profile: 'Профиль',
        settings: 'Настройки',
        logout: 'Выйти',
        welcome: 'Добро пожаловать',
        totalEarnings: 'Общий доход',
        totalSales: 'Общие продажи',
        activeProducts: 'Активные продукты',
        pendingCommissions: 'Ожидающие комиссии',
        recentActivity: 'Недавняя активность',
        performanceChart: 'График производительности'
      }
    };
  }

  getChineseTranslations() {
    return {
      translation: {
        dashboard: '仪表板',
        analytics: '分析',
        products: '产品',
        commissions: '佣金',
        payments: '付款',
        profile: '个人资料',
        settings: '设置',
        logout: '登出',
        welcome: '欢迎回来',
        totalEarnings: '总收入',
        totalSales: '总销售额',
        activeProducts: '活跃产品',
        pendingCommissions: '待处理佣金',
        recentActivity: '最近活动',
        performanceChart: '性能图表'
      }
    };
  }

  getJapaneseTranslations() {
    return {
      translation: {
        dashboard: 'ダッシュボード',
        analytics: '分析',
        products: '製品',
        commissions: 'コミッション',
        payments: '支払い',
        profile: 'プロフィール',
        settings: '設定',
        logout: 'ログアウト',
        welcome: 'おかえりなさい',
        totalEarnings: '総収益',
        totalSales: '総売上',
        activeProducts: 'アクティブ製品',
        pendingCommissions: '保留中のコミッション',
        recentActivity: '最近の活動',
        performanceChart: 'パフォーマンスチャート'
      }
    };
  }

  getKoreanTranslations() {
    return {
      translation: {
        dashboard: '대시보드',
        analytics: '분석',
        products: '제품',
        commissions: '수수료',
        payments: '결제',
        profile: '프로필',
        settings: '설정',
        logout: '로그아웃',
        welcome: '다시 오신 것을 환영합니다',
        totalEarnings: '총 수익',
        totalSales: '총 매출',
        activeProducts: '활성 제품',
        pendingCommissions: '대기 중인 수수료',
        recentActivity: '최근 활동',
        performanceChart: '성능 차트'
      }
    };
  }

  getArabicTranslations() {
    return {
      translation: {
        dashboard: 'لوحة التحكم',
        analytics: 'التحليلات',
        products: 'المنتجات',
        commissions: 'العمولات',
        payments: 'المدفوعات',
        profile: 'الملف الشخصي',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج',
        welcome: 'مرحباً بعودتك',
        totalEarnings: 'إجمالي الأرباح',
        totalSales: 'إجمالي المبيعات',
        activeProducts: 'المنتجات النشطة',
        pendingCommissions: 'العمولات المعلقة',
        recentActivity: 'النشاط الأخير',
        performanceChart: 'مخطط الأداء'
      }
    };
  }

  getHindiTranslations() {
    return {
      translation: {
        dashboard: 'डैशबोर्ड',
        analytics: 'विश्लेषण',
        products: 'उत्पाद',
        commissions: 'कमीशन',
        payments: 'भुगतान',
        profile: 'प्रोफ़ाइल',
        settings: 'सेटिंग्स',
        logout: 'लॉगआउट',
        welcome: 'वापसी पर स्वागत है',
        totalEarnings: 'कुल कमाई',
        totalSales: 'कुल बिक्री',
        activeProducts: 'सक्रिय उत्पाद',
        pendingCommissions: 'लंबित कमीशन',
        recentActivity: 'हाल की गतिविधि',
        performanceChart: 'प्रदर्शन चार्ट'
      }
    };
  }
}

module.exports = new InternationalizationService(); 