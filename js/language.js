/**
 * Bilingual Translations (Gujarati & English)
 * Default: Gujarati (gu) with instant toggle to English (en).
 */
const TRANSLATIONS = {
  gu: {
    appTitle: "ખાતાવહી - મની મેનેજમેન્ટ",
    tagline: "કોને કેટલા આપ્યા, કોની પાસેથી કેટલા લેવાના - સંપૂર્ણ હિસાબ",
    
    // Auth & Security
    enterPin: "તમારો 4-અંકનો PIN દાખલ કરો",
    setPin: "નવો 4-અંકનો સુરક્ષા PIN બનાવો",
    confirmPin: "PIN ફરીથી દાખલ કરો",
    unlock: "અનલૉક કરો",
    savePin: "PIN સેવ કરો",
    wrongPin: "ખોટો PIN! કૃપા કરીને ફરીથી પ્રયત્ન કરો.",
    pinMismatch: "બંને PIN સરખા નથી!",
    pinLength: "PIN ઓછામાં ઓછો 4 અંકનો હોવો જોઈએ.",
    locked: "એપ લૉક છે",
    lockNow: "લૉક કરો",
    changePin: "PIN બદલો",
    securityTitle: "સુરક્ષા અને ગોપનીયતા",
    securityDesc: "તમારો તમામ હિસાબ 256-bit AES-GCM એન્ક્રિપ્શન સાથે સુરક્ષિત છે. તમારા PIN વગર કોઈ ડેટા વાંચી શકશે નહીં.",
    
    // Navigation & Tabs
    tabHome: "હોમ / સભ્યો",
    tabTransactions: "બધા વ્યવહાર",
    tabAnalytics: "હિસાબ રિપોર્ટ",
    tabSettings: "સેટિંગ્સ",

    // Dashboard Cards
    totalToReceive: "કુલ લેવાના",
    totalToPay: "કુલ દેવાના",
    netBalance: "ચોખ્ખો બાકી હિસાબ",
    totalMembers: "કુલ સભ્યો",
    marketBalance: "બજારમાં રોકાયેલ",

    // Status Badges
    toReceive: "લેવાના",
    toPay: "દેવાના",
    settled: "સરભર (0)",
    statusAll: "બધા",
    statusReceive: "લેવાના છે",
    statusPay: "દેવાના છે",
    statusSettled: "ક્લિયર",

    // Actions
    addMember: "નવા સભ્ય ઉમેરો",
    addTransaction: "વ્યવહાર ઉમેરો",
    quickActionsTitle: "નવો વ્યવહાર અને સભ્ય ઉમેરો",
    quickActionsDesc: "અહીંથી તમે નવો વ્યવહાર (આપ્યા/લીધા) નોંધી શકો છો અથવા નવો સભ્ય ઉમેરી શકો છો.",
    totalMembersCount: "કુલ સભ્યો",
    totalTxnsCount: "કુલ વ્યવહારો",
    gaveMoney: "મેં આપ્યા / દીધા",
    receivedMoney: "મેં લીધા / જમા કર્યા",
    settleUp: "હિસાબ ક્લિયર કરો",
    searchPlaceholder: "નામ અથવા મોબાઈલ શોધો...",
    whatsappShare: "વ્હોટ્સએપ રીમાઇન્ડર",
    callMember: "કૉલ કરો",
    exportData: "બેકઅપ ડાઉનલોડ (JSON)",
    importData: "JSON માંથી ડેટા લાવો",
    clearData: "તમામ ડેટા ડિલીટ કરો",
    sampleData: "ડેમો ડેટા લોડ કરો",
    save: "સાચવો",
    cancel: "રદ કરો",
    delete: "ડીલીટ કરો",
    edit: "ફેરફાર કરો",
    confirmDeleteMember: "શું તમે ખરેખર આ સભ્ય અને તમામ વ્યવહારો ડીલીટ કરવા માંગો છો?",
    confirmDeleteTxn: "શું તમે આ વ્યવહાર ડીલીટ કરવા માંગો છો?",

    // Form Labels
    memberName: "સભ્યનું પૂરું નામ",
    memberPhone: "મોબાઈલ નંબર",
    memberNotes: "નોંધ / ઓળખાણ (ઓપ્શનલ)",
    selectMember: "સભ્ય પસંદ કરો",
    amount: "રકમ (₹)",
    date: "તારીખ",
    txnType: "વ્યવહારનો પ્રકાર",
    txnReason: "વિગત / કારણ (દા.ત. ઉછીના, ખરીદી, Google Pay)",
    runningBalance: "બાકી રકમ",

    // Member Details View
    totalGiven: "કુલ આપ્યા",
    totalReceived: "કુલ જમા / લીધા",
    transactionsCount: "કુલ વ્યવહારો",
    transactionHistory: "વ્યવહારની વિગત (ખાતાવહી)",
    noTransactions: "હજુ સુધી કોઈ વ્યવહાર નોંધાયેલ નથી.",
    noMembers: "હજુ કોઈ સભ્ય ઉમેરેલા નથી. નીચે આપેલ બટન પર ક્લિક કરીને શરૂ કરો.",

    // Export / Import
    encryptedBackup: "એન્ક્રિપ્ટેડ JSON (PIN પ્રોટેક્ટેડ - સુરક્ષિત)",
    plainBackup: "સામાન્ય JSON (અન-એન્ક્રિપ્ટેડ)",
    backupSuccess: "JSON ફાઈલ સફળતાપૂર્વક ડાઉનલોડ થઈ ગઈ છે! તમે તેને data/ ફોલ્ડરમાં રાખી શકો છો.",
    importSuccess: "ડેટા સફળતાપૂર્વક રીસ્ટોર થઈ ગયો!",
    importError: "ફાઇલ વાંચવામાં ભૂલ! અમાન્ય ફાઇલ અથવા ખોટો પાસવર્ડ.",

    // WhatsApp Message Template
    waReminderMessage: (name, amount, isReceive) => {
      if (isReceive) {
        return `નમસ્તે ${name},\nતમારી સાથેનો આપણો હિસાબ ચેક કરતાં હાલ ₹${amount} લેવાના બાકી નીકળે છે. અનુકૂળતા મુજબ જમા કરાવી આપવા વિનંતી.\n- આભાર!`;
      } else {
        return `નમસ્તે ${name},\nતમારી સાથેનો આપણો હિસાબ ચેક કરતાં મારે આપને ₹${amount} ચૂકવવાના બાકી છે. વહેલી તકે હિસાબ ચુકતે કરી આપીશ.\n- આભાર!`;
      }
    }
  },
  en: {
    appTitle: "Khatu - Money Manager",
    tagline: "Track who you gave money to & who owes you - Smart Ledger",
    
    // Auth & Security
    enterPin: "Enter your 4-digit PIN",
    setPin: "Create 4-digit Security PIN",
    confirmPin: "Confirm PIN",
    unlock: "Unlock",
    savePin: "Save PIN",
    wrongPin: "Incorrect PIN! Please try again.",
    pinMismatch: "PINs do not match!",
    pinLength: "PIN must be at least 4 digits.",
    locked: "App is Locked",
    lockNow: "Lock Now",
    changePin: "Change PIN",
    securityTitle: "Security & Privacy",
    securityDesc: "All ledger records are encrypted with 256-bit AES-GCM. Nobody can inspect your records without your PIN.",

    // Navigation & Tabs
    tabHome: "Home / Members",
    tabTransactions: "All Transactions",
    tabAnalytics: "Analytics",
    tabSettings: "Settings",

    // Dashboard Cards
    totalToReceive: "To Receive (Lena)",
    totalToPay: "To Pay (Dena)",
    netBalance: "Net Balance",
    totalMembers: "Total Members",
    marketBalance: "Active In Market",

    // Status Badges
    toReceive: "To Receive",
    toPay: "To Pay",
    settled: "Settled (0)",
    statusAll: "All",
    statusReceive: "To Receive",
    statusPay: "To Pay",
    statusSettled: "Settled",

    // Actions
    addMember: "Add Member",
    addTransaction: "Add Transaction",
    quickActionsTitle: "Add Transaction & Member",
    quickActionsDesc: "Record a new transaction (gave/received) or add a new member from here.",
    totalMembersCount: "Total Members",
    totalTxnsCount: "Total Transactions",
    gaveMoney: "I Gave (Money Out)",
    receivedMoney: "I Received (Money In / Jama)",
    settleUp: "Settle Full Amount",
    searchPlaceholder: "Search by name or phone...",
    whatsappShare: "WhatsApp Reminder",
    callMember: "Call",
    exportData: "Download Backup (JSON)",
    importData: "Import from JSON",
    clearData: "Reset All Data",
    sampleData: "Load Demo Data",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirmDeleteMember: "Are you sure you want to delete this member and all transactions?",
    confirmDeleteTxn: "Are you sure you want to delete this transaction?",

    // Form Labels
    memberName: "Member Full Name",
    memberPhone: "Phone Number",
    memberNotes: "Notes / Relation (Optional)",
    selectMember: "Select Member",
    amount: "Amount (₹)",
    date: "Date",
    txnType: "Transaction Type",
    txnReason: "Note / Description (e.g. Loan, GPay, Cash)",
    runningBalance: "Balance",

    // Member Details View
    totalGiven: "Total Given",
    totalReceived: "Total Received (Jama)",
    transactionsCount: "Total Transactions",
    transactionHistory: "Transaction History (Ledger)",
    noTransactions: "No transactions recorded yet.",
    noMembers: "No members added yet. Click below to add your first member.",

    // Export / Import
    encryptedBackup: "Encrypted JSON (PIN Protected)",
    plainBackup: "Plain JSON (Unencrypted)",
    backupSuccess: "JSON file downloaded! You can save it in the data/ folder.",
    importSuccess: "Data restored successfully!",
    importError: "Failed to import file! Invalid file format or wrong PIN.",

    // WhatsApp Message Template
    waReminderMessage: (name, amount, isReceive) => {
      if (isReceive) {
        return `Hello ${name},\nRegarding our ledger, pending balance to receive is ₹${amount}. Please clear whenever convenient.\n- Thank you!`;
      } else {
        return `Hello ${name},\nRegarding our ledger, I have ₹${amount} pending to pay you. I will clear it soon.\n- Thank you!`;
      }
    }
  }
};

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('khatu_lang') || 'gu';
  }

  setLang(lang) {
    if (TRANSLATIONS[lang]) {
      this.currentLang = lang;
      localStorage.setItem('khatu_lang', lang);
      this.updateDOM();
    }
  }

  t(key, ...args) {
    const text = TRANSLATIONS[this.currentLang][key] || TRANSLATIONS['gu'][key] || key;
    if (typeof text === 'function') {
      return text(...args);
    }
    return text;
  }

  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (typeof translation === 'string') {
        el.innerText = translation;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', this.t(key));
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', this.t(key));
    });

    // Update active state on language buttons
    const langBtn = document.getElementById('btnLangToggle');
    if (langBtn) {
      langBtn.innerText = this.currentLang === 'gu' ? 'EN' : 'ગુજરાતી';
      langBtn.setAttribute('title', this.currentLang === 'gu' ? 'Switch to English' : 'ગુજરાતીમાં ફેરવો');
    }
  }
}

window.i18n = new I18n();
