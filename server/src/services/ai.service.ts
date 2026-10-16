/**
 * AI Engine for Deal&Demand
 * Swappable module: Production-ready heuristics + interfaces for Gemini/LLM API integration
 */

export interface RequirementExpansionResult {
  expandedDescription: string;
  suggestedMaterials: string[];
  suggestedDimensions: string;
  suggestedFinish: string;
  missingDetailsQuestions: string[];
  recommendedCategorySlug: string;
}

export interface PriceEstimateResult {
  minPrice: number;
  maxPrice: number;
  suggestedPrice: number;
  estimatedDays: number;
  priceBreakdown: {
    materialEst: number;
    labourEst: number;
    logisticsEst: number;
    taxesEst: number;
  };
  explanation: string;
}

export interface MatchScoreResult {
  score: number; // 0 - 100
  reasons: string[];
  isTopMatch: boolean;
}

export interface QuotationSummaryResult {
  summary: string;
  bestValueQuotationId?: string;
  fastestQuotationId?: string;
  keyDifferences: string[];
}

export class AIService {
  /**
   * Turns sparse user input into rich craftsmanship requirement specifications
   */
  static async expandRequirement(
    categorySlug: string,
    keywords: string,
    rawDetails: Record<string, any>
  ): Promise<RequirementExpansionResult> {
    const kw = (keywords || '').toLowerCase();
    
    // Category-specific intelligence
    let expanded = `Detailed requirement for professional ${categorySlug.replace('-', ' ')} execution:\n\n`;
    const materials: string[] = [];
    const questions: string[] = [];
    let suggestedDim = 'Standard specifications';
    let suggestedFin = 'Standard matte/protective coat';

    if (categorySlug.includes('carpenter') || kw.includes('door') || kw.includes('wood') || kw.includes('wardrobe')) {
      expanded += `Fabrication of custom woodwork incorporating premium grade timber and precision joinery. `;
      expanded += `Includes surface preparation, termite anti-fungal treatment, sand-papering, and installation with high-durability hardware. `;
      materials.push('Grade-A CP Teak Wood', 'Marine Plywood (BWP 710)', 'Enox / Hafele Soft-Close Hinges');
      suggestedDim = 'Height: 7ft, Width: 3.5ft, Thickness: 35mm (or custom on-site measurement)';
      suggestedFin = 'Melamine Matte Finish with natural wood grain polish';
      questions.push('Do you prefer concealed hinges or classic antique brass fittings?');
      questions.push('Will the wall frame (chowkhat) be provided or crafted by the worker?');
    } else if (categorySlug.includes('weld') || categorySlug.includes('fabricat') || kw.includes('gate') || kw.includes('grill')) {
      expanded += `Structural metal fabrication utilizing corrosion-resistant mild steel / stainless steel sections. `;
      expanded += `All joints argon/arc welded, ground smooth, zinc-chromate primed with two coats of anti-rust polyurethane enamel. `;
      materials.push('MS Square Hollow Sections (16-gauge)', 'SS 304 Grade Railings', 'Zinc Chromate Primer');
      suggestedDim = 'Length: 12ft, Height: 5ft standard gate section';
      suggestedFin = 'Jet Black Satin Powder Coating (UV resistant)';
      questions.push('Do you need manual hinges or motorized automatic slider brackets?');
      questions.push('Is site electricity/power available for welding generators?');
    } else if (categorySlug.includes('paint') || kw.includes('wall') || kw.includes('exterior')) {
      expanded += `Complete surface refinishing including scraping loose paint, acrylic crack filling, 2 coats of water-resistant primer, and 2 finish coats of premium emulsion. `;
      materials.push('Asian Paints Royale / Apex Ultima', 'Birla White Putty', 'Anti-fungal primer');
      suggestedDim = 'Approx 800 - 1200 sq.ft carpet area';
      suggestedFin = 'Sheen / Silk washable finish';
      questions.push('Are there existing dampness patches or water seepage on the walls?');
      questions.push('Do you require furniture masking and protective floor sheeting?');
    } else {
      expanded += `Professional craftsmanship execution according to architectural standards, ensuring safety, durability, and neat finishing.`;
      materials.push('Industry standard high-grade supplies');
      questions.push('What is the preferred start date and access hours?');
    }

    if (keywords) {
      expanded += `\n\nCustomer specific notes incorporated: "${keywords}".`;
    }

    return {
      expandedDescription: expanded,
      suggestedMaterials: materials,
      suggestedDimensions: suggestedDim,
      suggestedFinish: suggestedFin,
      missingDetailsQuestions: questions,
      recommendedCategorySlug: categorySlug,
    };
  }

  /**
   * Generates realistic price and timeline estimation based on industry norms in India
   */
  static async estimatePrice(
    categorySlug: string,
    specs: Record<string, any>
  ): Promise<PriceEstimateResult> {
    let base = 8000;
    let days = 4;

    const cat = categorySlug.toLowerCase();
    if (cat.includes('carpenter')) {
      base = 14000;
      days = 5;
    } else if (cat.includes('weld') || cat.includes('fabricat')) {
      base = 18000;
      days = 6;
    } else if (cat.includes('paint')) {
      base = 12000;
      days = 4;
    } else if (cat.includes('kitchen')) {
      base = 65000;
      days = 14;
    } else if (cat.includes('electric') || cat.includes('plumb')) {
      base = 4500;
      days = 2;
    }

    const materialEst = Math.round(base * 0.58);
    const labourEst = Math.round(base * 0.32);
    const logisticsEst = Math.round(base * 0.05);
    const taxesEst = Math.round(base * 0.05);
    const totalEst = materialEst + labourEst + logisticsEst + taxesEst;

    return {
      minPrice: Math.round(totalEst * 0.85),
      maxPrice: Math.round(totalEst * 1.25),
      suggestedPrice: totalEst,
      estimatedDays: days,
      priceBreakdown: {
        materialEst,
        labourEst,
        logisticsEst,
        taxesEst,
      },
      explanation: `Calculated from local market rates for raw materials, ${days} days of skilled labor, transport, and 5% platform escrow protection.`,
    };
  }

  /**
   * Calculates Worker Affinity / Match score with a deal
   */
  static calculateMatchScore(
    deal: { categorySlug: string; city: string; budget: number; urgency: string },
    worker: {
      categories: string[];
      serviceArea: string;
      rating: number;
      jobsCompleted: number;
    }
  ): MatchScoreResult {
    let score = 50;
    const reasons: string[] = [];

    // Category match
    if (worker.categories.includes(deal.categorySlug)) {
      score += 25;
      reasons.push('Primary category specialization match');
    }

    // Location match
    if (
      worker.serviceArea.toLowerCase().includes(deal.city.toLowerCase()) ||
      deal.city.toLowerCase().includes(worker.serviceArea.toLowerCase())
    ) {
      score += 15;
      reasons.push(`Based locally in ${deal.city}`);
    }

    // Rating boost
    if (worker.rating >= 4.8) {
      score += 7;
      reasons.push(`High satisfaction rating (${worker.rating}★)`);
    }

    // Experience boost
    if (worker.jobsCompleted >= 10) {
      score += 3;
      reasons.push(`${worker.jobsCompleted}+ verified projects completed`);
    }

    const finalScore = Math.min(99, Math.max(30, score));
    return {
      score: finalScore,
      reasons,
      isTopMatch: finalScore >= 85,
    };
  }

  /**
   * Summarizes multiple worker quotations with AI insights
   */
  static summarizeQuotations(quotes: Array<{
    id: string;
    workerName: string;
    totalPrice: number;
    timelineDays: number;
    warrantyMonths: number;
    rating: number;
  }>): QuotationSummaryResult {
    if (!quotes || quotes.length === 0) {
      return {
        summary: 'No quotations submitted yet.',
        keyDifferences: [],
      };
    }

    const sortedByPrice = [...quotes].sort((a, b) => a.totalPrice - b.totalPrice);
    const sortedByTime = [...quotes].sort((a, b) => a.timelineDays - b.timelineDays);

    const bestValue = sortedByPrice[0];
    const fastest = sortedByTime[0];

    const keyDifferences = [
      `Price ranges from ₹${sortedByPrice[0].totalPrice.toLocaleString()} to ₹${sortedByPrice[quotes.length - 1].totalPrice.toLocaleString()}.`,
      `Fastest completion is in ${fastest.timelineDays} days by ${fastest.workerName}.`,
      `Warranties vary between ${Math.min(...quotes.map((q) => q.warrantyMonths))} and ${Math.max(...quotes.map((q) => q.warrantyMonths))} months.`,
    ];

    const summary = `Analyzed ${quotes.length} quotations. ${bestValue.workerName} offers the lowest bid at ₹${bestValue.totalPrice.toLocaleString()} (${bestValue.timelineDays} days), while ${fastest.workerName} guarantees the quickest delivery (${fastest.timelineDays} days).`;

    return {
      summary,
      bestValueQuotationId: bestValue.id,
      fastestQuotationId: fastest.id,
      keyDifferences,
    };
  }

  /**
   * Simulates computer vision analysis on uploaded reference photos
   */
  static analyzeUploadedImage(fileName: string): {
    detectedObject: string;
    recommendedMaterial: string;
    suggestedDimensions: string;
  } {
    const fn = fileName.toLowerCase();
    if (fn.includes('door') || fn.includes('wood')) {
      return {
        detectedObject: 'Double Paneled Entrance Door',
        recommendedMaterial: 'Solid Teak Wood with Brass Inlay',
        suggestedDimensions: '84" x 38" x 1.75"',
      };
    }
    if (fn.includes('gate') || fn.includes('grill')) {
      return {
        detectedObject: 'Modern Horizontal Slat Balcony Grill',
        recommendedMaterial: 'Grade 304 Stainless Steel (Powder Coated)',
        suggestedDimensions: '12 ft length x 3.5 ft height',
      };
    }
    return {
      detectedObject: 'Custom Craftsmanship Item',
      recommendedMaterial: 'High Durability Composite / Hardwood',
      suggestedDimensions: 'Standard custom architectural fit',
    };
  }

  /**
   * Chat translation between English, Hindi and Malayalam
   */
  static translateMessage(
    text: string,
    targetLang: 'en' | 'hi' | 'ml'
  ): { translated: string; sourceLang: string } {
    const sampleTranslations: Record<string, Record<string, string>> = {
      'Hello, when can you start the work?': {
        hi: 'नमस्ते, आप काम कब शुरू कर सकते हैं?',
        ml: 'നമസ്കാരം, ജോലി എപ്പോൾ ആരംഭിക്കാൻ കഴിയും?',
        en: 'Hello, when can you start the work?',
      },
      'I can start tomorrow morning at 9 AM.': {
        hi: 'मैं कल सुबह 9 बजे काम शुरू कर सकता हूँ।',
        ml: 'എനിക്ക് നാളെ രാവിലെ 9 മണിക്ക് ആരംഭിക്കാം.',
        en: 'I can start tomorrow morning at 9 AM.',
      },
      'Please send the quotation breakdown.': {
        hi: 'कृपया कोटेशन का विवरण भेजें।',
        ml: 'ദയവായി കൊട്ടേഷൻ വിശദാംശങ്ങൾ അയക്കുക.',
        en: 'Please send the quotation breakdown.',
      },
      'Materials will be delivered on Monday.': {
        hi: 'सामग्री सोमवार को वितरित की जाएगी।',
        ml: 'സാധനങ്ങൾ തിങ്കളാഴ്ച എത്തും.',
        en: 'Materials will be delivered on Monday.',
      },
    };

    // Check exact or partial match
    for (const [key, map] of Object.entries(sampleTranslations)) {
      if (text.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(text.toLowerCase())) {
        return {
          translated: map[targetLang] || text,
          sourceLang: targetLang === 'en' ? 'hi' : 'en',
        };
      }
    }

    // Heuristic prefix for realistic demonstration
    if (targetLang === 'hi') {
      return { translated: `[अनुवादित]: ${text}`, sourceLang: 'en' };
    }
    if (targetLang === 'ml') {
      return { translated: `[തർജ്ജമ]: ${text}`, sourceLang: 'en' };
    }
    return { translated: text, sourceLang: 'hi' };
  }

  /**
   * Evaluates fraud or safety risk (soliciting offline cash, contact leaks)
   */
  static detectFraudRisk(text: string, budget: number): { riskScore: number; flags: string[] } {
    let score = 0;
    const flags: string[] = [];

    const phoneRegex = /(\+?91[\-\s]?)?[6789]\d{9}/g;
    const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g;

    if (phoneRegex.test(text)) {
      score += 40;
      flags.push('Direct phone number detected in public description');
    }
    if (emailRegex.test(text)) {
      score += 30;
      flags.push('Email address detected in text');
    }
    if (/call me|whatsapp me|pay direct|cash only/i.test(text)) {
      score += 25;
      flags.push('Bypassing platform escrow terms requested');
    }
    if (budget > 500000) {
      score += 15;
      flags.push('High value project requires administrative verification');
    }

    return { riskScore: Math.min(100, score), flags };
  }
}
