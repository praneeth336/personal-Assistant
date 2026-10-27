// JARVIS Application Launcher & Security Authorization Service

export const DEFAULT_MASTER_PASSWORD = 'Jyo_412';

export const INITIAL_APPS = [
  {
    id: 'youtube',
    name: 'YouTube',
    aliases: ['youtube', 'youtude', 'yt', 'you tube', 'video', 'videos'],
    url: 'https://www.youtube.com',
    category: 'Entertainment & Media',
    icon: 'PlaySquare',
    isSecured: false,
    description: 'Video streaming and entertainment platform'
  },
  {
    id: 'gmail',
    name: 'Google Mail (Gmail)',
    aliases: ['gmail', 'google mail', 'mail', 'email', 'emails', 'inbox'],
    url: 'https://mail.google.com',
    category: 'Communication & Confidential',
    icon: 'Mail',
    isSecured: true,
    description: 'Confidential personal & enterprise email inbox'
  },
  {
    id: 'github',
    name: 'GitHub',
    aliases: ['github', 'git', 'gh', 'repo', 'repositories', 'code'],
    url: 'https://github.com',
    category: 'Developer & Engineering',
    icon: 'Github',
    isSecured: false,
    description: 'Code repository, version control & developer workspace'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    aliases: ['whatsapp', 'whatsapp web', 'wa', 'chat', 'messages'],
    url: 'https://web.whatsapp.com',
    category: 'Private Messaging',
    icon: 'MessageSquare',
    isSecured: true,
    description: 'Private encrypted messaging and direct communications'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    aliases: ['drive', 'google drive', 'docs', 'cloud storage', 'files'],
    url: 'https://drive.google.com',
    category: 'Cloud Storage & Documents',
    icon: 'HardDrive',
    isSecured: true,
    description: 'Protected cloud storage, documents, and spreadsheets'
  },
  {
    id: 'netbanking',
    name: 'Financial & Net Banking Portal',
    aliases: ['bank', 'banking', 'netbanking', 'finance', 'financial portal', 'account'],
    url: 'https://www.google.com/finance',
    category: 'Banking & Financial',
    icon: 'CreditCard',
    isSecured: true,
    description: 'Secure financial accounts and payment management'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    aliases: ['spotify', 'music', 'songs', 'playlist'],
    url: 'https://open.spotify.com',
    category: 'Audio & Music',
    icon: 'Music',
    isSecured: false,
    description: 'Music streaming and podcasts'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    aliases: ['calculator', 'calc', 'math'],
    url: 'https://www.google.com/search?q=calculator',
    category: 'System Utility',
    icon: 'Calculator',
    isSecured: false,
    description: 'Standard computation & scientific calculator'
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    aliases: ['calendar', 'google calendar', 'schedule', 'schedules', 'agenda'],
    url: 'https://calendar.google.com',
    category: 'Schedule & Organization',
    icon: 'Calendar',
    isSecured: true,
    description: 'Personal agenda, meetings & deadline schedule'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    aliases: ['chatgpt', 'openai', 'gpt'],
    url: 'https://chat.openai.com',
    category: 'AI Assistant',
    icon: 'Bot',
    isSecured: false,
    description: 'Conversational artificial intelligence portal'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    aliases: ['linkedin', 'jobs', 'network'],
    url: 'https://www.linkedin.com',
    category: 'Professional Network',
    icon: 'Briefcase',
    isSecured: false,
    description: 'Professional networking and career platform'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    aliases: ['twitter', 'x', 'tweets'],
    url: 'https://x.com',
    category: 'Social Feed',
    icon: 'Share2',
    isSecured: false,
    description: 'Real-time global social feed and updates'
  }
];

// Load registered applications from localStorage
export function getRegisteredApps() {
  try {
    const saved = localStorage.getItem('jarvis_registered_apps');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load registered apps:', e);
  }
  return INITIAL_APPS;
}

// Save registered applications to localStorage
export function saveRegisteredApps(apps) {
  try {
    localStorage.setItem('jarvis_registered_apps', JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save registered apps:', e);
  }
}

// Get the master password for secured application verification
export function getMasterPassword() {
  const stored = localStorage.getItem('jarvis_security_password');
  // Auto-migrate from legacy default if present
  if (!stored || stored === 'jarvis123') {
    localStorage.setItem('jarvis_security_password', DEFAULT_MASTER_PASSWORD);
    return DEFAULT_MASTER_PASSWORD;
  }
  return stored;
}

// Set a new master password
export function setMasterPassword(newPassword) {
  if (newPassword && newPassword.trim().length >= 4) {
    localStorage.setItem('jarvis_security_password', newPassword.trim());
    return true;
  }
  return false;
}

// Validate password
export function verifySecurityPassword(inputPassword) {
  const current = getMasterPassword();
  return inputPassword.trim() === current.trim();
}

/**
 * Detects if a command matches an application open/launch request.
 * e.g., "jarvis open youtube", "open youtude", "launch gmail", "jarvis start spotify"
 */
export function detectAppCommand(text) {
  if (!text) return null;
  const raw = text.toLowerCase().trim();

  // Pattern matching open commands
  const patterns = [
    /^(?:jarvis\s+)?(?:please\s+)?(?:open|launch|start|run|go\s+to|access)\s+(?:the\s+)?(?:app\s+|application\s+)?(.+)$/i,
    /^(?:open|launch|start)\s+(.+)$/i
  ];

  let targetAppName = null;
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match && match[1]) {
      targetAppName = match[1].trim();
      break;
    }
  }

  if (!targetAppName) return null;

  // Clean trailing punctuation or filler words
  targetAppName = targetAppName.replace(/[?!.]+$/, '').replace(/^(the|a|an)\s+/, '').trim();

  const apps = getRegisteredApps();

  // 1. Direct alias or name exact match
  for (const app of apps) {
    if (app.name.toLowerCase() === targetAppName) {
      return app;
    }
    if (app.aliases && app.aliases.some(alias => alias.toLowerCase() === targetAppName)) {
      return app;
    }
  }

  // 2. Partial / typo match (e.g. "youtude" -> "youtube", "git hub" -> "github")
  const normalizedTarget = targetAppName.replace(/[^a-z0-9]/g, '');
  for (const app of apps) {
    const normalizedName = app.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedName === normalizedTarget || normalizedName.includes(normalizedTarget) || normalizedTarget.includes(normalizedName)) {
      return app;
    }
    for (const alias of app.aliases || []) {
      const normAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normAlias === normalizedTarget) {
        return app;
      }
      // Simple levenshtein / typo check for close matches like "youtude" vs "youtube"
      if (Math.abs(normAlias.length - normalizedTarget.length) <= 1 && normAlias.length > 4) {
        let diffCount = 0;
        for (let i = 0; i < Math.min(normAlias.length, normalizedTarget.length); i++) {
          if (normAlias[i] !== normalizedTarget[i]) diffCount++;
        }
        if (diffCount <= 1) {
          return app;
        }
      }
    }
  }

  // 3. Dynamic generic web app launch fallback if user says "jarvis open [anything]"
  if (targetAppName.length >= 2 && !targetAppName.includes('task') && !targetAppName.includes('schedule') && !targetAppName.includes('memory')) {
    return {
      id: `custom-${Date.now()}`,
      name: targetAppName.charAt(0).toUpperCase() + targetAppName.slice(1),
      aliases: [targetAppName],
      url: targetAppName.startsWith('http') ? targetAppName : `https://www.${targetAppName.replace(/\s+/g, '')}.com`,
      category: 'Web Application',
      icon: 'Globe',
      isSecured: false,
      isDynamic: true,
      description: `User-requested application: ${targetAppName}`
    };
  }

  return null;
}

// Safely launch application
export function launchApp(app) {
  if (!app || !app.url) return false;
  try {
    const win = window.open(app.url, '_blank', 'noopener,noreferrer');
    if (win) {
      win.focus();
      return true;
    }
  } catch (err) {
    console.error('Launch failed:', err);
  }
  return false;
}
