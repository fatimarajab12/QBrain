/**
 * Chat Bot Utilities
 * 
 * All utility functions for Chat Bot functionality in one file.
 */

/**
 * Format conversation history for LLM prompt
 * Improved: Category filtering, better ordering, keyword prioritization
 */
export function formatChatHistory(history = [], maxMessages = 10, category = null) {
  if (!history || history.length === 0) return null;
  
  let recentHistory = history.slice(-maxMessages);
  
  // Filter by category if provided
  if (category) {
    const categoryKeywords = getCategoryKeywords(category);
    const categoryRelevant = recentHistory.filter(msg => {
      const text = (msg.text || '').toLowerCase();
      return categoryKeywords.some(kw => text.includes(kw));
    });
    // If we have category-relevant messages, prioritize them
    if (categoryRelevant.length > 0) {
      // Mix: category-relevant first, then others
      const others = recentHistory.filter(msg => !categoryRelevant.includes(msg));
      recentHistory = [...categoryRelevant, ...others].slice(-maxMessages);
    }
  }
  
  // Sort by relevance: recent messages with important keywords first
  const keywords = extractHistoryKeywords(recentHistory, category);
  if (keywords.length > 0) {
    recentHistory.sort((a, b) => {
      const aText = (a.text || '').toLowerCase();
      const bText = (b.text || '').toLowerCase();
      const aScore = keywords.filter(kw => aText.includes(kw)).length;
      const bScore = keywords.filter(kw => bText.includes(kw)).length;
      return bScore - aScore;
    });
  }
  
  // Format as natural conversation (without timestamps for cleaner context)
  return recentHistory
    .map((msg) => {
      const role = msg.sender === "user" ? "User" : "Assistant";
      return `${role}: ${msg.text}`;
    })
    .join("\n\n");
}

/**
 * Extract keywords from conversation history for query enhancement
 * Improved: Takes last 4-6 messages, better stop words filtering
 */
export function extractHistoryKeywords(history = [], category = null) {
  if (!history || history.length === 0) return [];
  
  // Take last 4-6 messages (increased from 4)
  const recentMessages = history.slice(-6);
  
  // Filter by category if provided
  let filteredMessages = recentMessages;
  if (category) {
    const categoryKeywords = getCategoryKeywords(category);
    filteredMessages = recentMessages.filter(msg => {
      const text = (msg.text || '').toLowerCase();
      return categoryKeywords.some(kw => text.includes(kw));
    });
    // If no category match, use all recent messages
    if (filteredMessages.length === 0) {
      filteredMessages = recentMessages;
    }
  }
  
  const text = filteredMessages
    .map(msg => msg.text || '')
    .join(' ')
    .toLowerCase();
  
  const keywords = text
    .match(/\b[a-z]{4,}\b/gi)
    ?.filter(word => {
      const stopWords = new Set([
        // Common stop words
        'this', 'that', 'what', 'when', 'where', 'which', 'how', 'why',
        'from', 'with', 'about', 'would', 'could', 'should', 'please',
        'tell', 'explain', 'show', 'give', 'need', 'want', 'know',
        'can', 'will', 'may', 'might', 'must', 'shall', 'have', 'has',
        'had', 'are', 'is', 'was', 'were', 'been', 'being', 'does',
        'did', 'do', 'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then',
        'there', 'their', 'they', 'them', 'these', 'those', 'here',
        'there', 'very', 'just', 'only', 'also', 'more', 'most', 'some',
        'any', 'all', 'each', 'every', 'other', 'another', 'such', 'same'
      ]);
      return !stopWords.has(word.toLowerCase());
    }) || [];
  
  const keywordCounts = {};
  keywords.forEach(kw => {
    keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
  });
  
  // Return top 6-8 keywords (increased from 5)
  return Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([kw]) => kw);
}

/**
 * Get category-specific keywords for filtering
 */
function getCategoryKeywords(category) {
  const categoryMap = {
    'functional': ['functional', 'feature', 'requirement', 'function', 'behavior', 'shall', 'must'],
    'workflow': ['workflow', 'process', 'step', 'procedure', 'flow', 'sequence', 'state'],
    'interface': ['interface', 'ui', 'user interface', 'api', 'integration', 'screen', 'form'],
    'quality': ['quality', 'performance', 'security', 'usability', 'reliability', 'test'],
    'constraint': ['constraint', 'assumption', 'dependency', 'limitation', 'restriction', 'rule'],
    'data': ['data', 'dictionary', 'field', 'table', 'column', 'attribute', 'entity'],
    'report': ['report', 'document', 'format', 'output', 'statement', 'summary'],
    'notification': ['notification', 'alert', 'message', 'communication', 'email', 'sms', 'push']
  };
  return categoryMap[category?.toLowerCase()] || [];
}

/**
 * Validate conversation history format
 */
export function validateHistory(history) {
  if (!Array.isArray(history)) return false;
  
  return history.every(msg => 
    msg && 
    typeof msg === 'object' &&
    (msg.sender === 'user' || msg.sender === 'bot') &&
    typeof msg.text === 'string' &&
    msg.text.trim().length > 0
  );
}

/**
 * Enhanced query expansion for Chat Bot
 * Improved: Priority-based domain terms, category-aware expansion, dynamic term addition
 */
export function expandQueryForChatBot(question, history = [], category = null) {
  if (!question || typeof question !== "string") return question;
  
  let expanded = question;
  
  // Detect category from question if not provided
  if (!category) {
    category = detectQuestionCategory(question);
  }
  
  // Add conversation context keywords if history exists (category-aware)
  if (history && history.length > 0) {
    const historyKeywords = extractHistoryKeywords(history, category);
    if (historyKeywords.length > 0) {
      // Prioritize category-relevant keywords
      const categoryKeywords = getCategoryKeywords(category);
      const prioritized = historyKeywords.sort((a, b) => {
        const aInCategory = categoryKeywords.some(kw => a.includes(kw) || kw.includes(a));
        const bInCategory = categoryKeywords.some(kw => b.includes(kw) || kw.includes(b));
        if (aInCategory && !bInCategory) return -1;
        if (!aInCategory && bInCategory) return 1;
        return 0;
      });
      expanded += ` ${prioritized.join(" ")}`;
    }
  }
  
  // Priority-based domain terms (higher priority first)
  const domainTermsPriority = [
    "functional", "workflow", "interface", "quality",
    "constraint", "data", "report", "notification"
  ];
  
  // Category-specific terms with priority
  const categoryTerms = getCategoryTerms(category);
  const questionLower = question.toLowerCase();
  
  // Add category-specific terms first (highest priority)
  const missingCategoryTerms = categoryTerms.filter(term => 
    !questionLower.includes(term.toLowerCase())
  );
  if (missingCategoryTerms.length > 0) {
    expanded += ` ${missingCategoryTerms.slice(0, 2).join(" ")}`;
  }
  
  // Add general domain terms with priority
  const generalTerms = [
    "requirement", "specification", "feature", "test case",
    "workflow", "process", "section", "documentation", "SRS"
  ];
  
  // Prioritize terms based on domainTermsPriority
  const prioritizedGeneralTerms = generalTerms.sort((a, b) => {
    const aIndex = domainTermsPriority.findIndex(term => a.includes(term));
    const bIndex = domainTermsPriority.findIndex(term => b.includes(term));
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  const missingGeneralTerms = prioritizedGeneralTerms.filter(term => 
    !questionLower.includes(term.toLowerCase())
  ).slice(0, 2);
  
  if (missingGeneralTerms.length > 0) {
    expanded += ` ${missingGeneralTerms.join(" ")}`;
  }
  
  return expanded;
}

/**
 * Detect question category from question text
 */
function detectQuestionCategory(question) {
  const questionLower = question.toLowerCase();
  
  const categoryPatterns = {
    'functional': ['feature', 'functional', 'requirement', 'function', 'behavior', 'shall', 'must'],
    'workflow': ['workflow', 'process', 'step', 'procedure', 'flow', 'sequence', 'state', 'lifecycle'],
    'interface': ['interface', 'ui', 'user interface', 'api', 'integration', 'screen', 'form', 'page'],
    'quality': ['quality', 'performance', 'security', 'usability', 'reliability', 'test case', 'testing'],
    'constraint': ['constraint', 'assumption', 'dependency', 'limitation', 'restriction', 'rule'],
    'data': ['data', 'dictionary', 'field', 'table', 'column', 'attribute', 'entity', 'database'],
    'report': ['report', 'document', 'format', 'output', 'statement', 'summary'],
    'notification': ['notification', 'alert', 'message', 'communication', 'email', 'sms', 'push']
  };
  
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(pattern => questionLower.includes(pattern))) {
      return category;
    }
  }
  
  return null;
}

/**
 * Get category-specific terms for expansion
 */
function getCategoryTerms(category) {
  const categoryMap = {
    'functional': ['functional requirement', 'feature', 'behavior', 'use case'],
    'workflow': ['workflow', 'process', 'step', 'procedure', 'lifecycle'],
    'interface': ['interface', 'user interface', 'UI', 'API', 'integration'],
    'quality': ['quality', 'performance', 'security', 'test case'],
    'constraint': ['constraint', 'assumption', 'dependency', 'limitation'],
    'data': ['data dictionary', 'field', 'table', 'attribute'],
    'report': ['report', 'document', 'format', 'output'],
    'notification': ['notification', 'alert', 'message', 'communication']
  };
  return categoryMap[category?.toLowerCase()] || [];
}

/**
 * Create multi-query search for better context retrieval
 * Improved: Category-aware variations, better coverage
 */
export function createQueryVariations(question, history = [], category = null) {
  const variations = [question];
  
  // Detect category if not provided
  if (!category) {
    category = detectQuestionCategory(question);
  }
  
  // Add expanded query with history and category awareness
  const expandedQuery = expandQueryForChatBot(question, history, category);
  if (expandedQuery !== question) {
    variations.push(expandedQuery);
  }
  
  // Add keyword-only variation (useful for semantic search)
  const words = question.toLowerCase().match(/\b[a-z]{4,}\b/gi) || [];
  if (words.length >= 2) {
    const keywordVariation = words
      .filter(word => {
        // Filter out common stop words
        const stopWords = new Set(['this', 'that', 'what', 'when', 'where', 'which', 'how', 'why']);
        return !stopWords.has(word.toLowerCase());
      })
      .slice(0, 5)
      .join(" ");
    if (keywordVariation) {
      variations.push(keywordVariation);
    }
  }
  
  // Add history-enhanced variation
  if (history && history.length > 0) {
    const historyKeywords = extractHistoryKeywords(history, category);
    if (historyKeywords.length > 0) {
      variations.push(`${question} ${historyKeywords.join(" ")}`);
    }
  }
  
  // Add category-specific variation if category detected
  if (category) {
    const categoryTerms = getCategoryTerms(category);
    if (categoryTerms.length > 0) {
      variations.push(`${question} ${categoryTerms.slice(0, 2).join(" ")}`);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(variations)];
}

