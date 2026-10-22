/**
 * StorageService - Manages encrypted persistence, member calculations, and JSON export/import.
 */
class StorageService {
  constructor() {
    this.sessionPin = null;
    this.data = {
      members: [],
      transactions: [],
      settings: {
        currency: '₹',
        theme: 'dark',
        autoLockMinutes: 5
      }
    };
    this.isUnlocked = false;
    this.autoLockTimer = null;
  }

  /**
   * Check if user has initialized a PIN before
   */
  hasPinConfigured() {
    return !!localStorage.getItem('khatu_pin_hash');
  }

  /**
   * Set up new PIN on first run or when changing PIN
   */
  async setupPin(newPin) {
    if (!newPin || newPin.length < 4) {
      throw new Error(window.i18n ? window.i18n.t('pinLength') : 'PIN must be at least 4 digits');
    }

    const { salt, hash } = await CryptoService.hashPin(newPin);
    localStorage.setItem('khatu_pin_salt', salt);
    localStorage.setItem('khatu_pin_hash', hash);
    this.sessionPin = newPin;
    this.isUnlocked = true;

    // If there was existing data, re-save with new PIN
    await this.save();
    this.resetAutoLockTimer();
    return true;
  }

  /**
   * Unlock app with PIN
   */
  async unlock(pin) {
    const storedHash = localStorage.getItem('khatu_pin_hash');
    const storedSalt = localStorage.getItem('khatu_pin_salt');

    if (!storedHash || !storedSalt) {
      // First time user
      await this.setupPin(pin);
      return true;
    }

    const { hash } = await CryptoService.hashPin(pin, storedSalt);
    if (hash !== storedHash) {
      throw new Error('INVALID_PIN');
    }

    this.sessionPin = pin;

    // Load and decrypt vault
    const vaultString = localStorage.getItem('khatu_vault');
    if (vaultString) {
      try {
        const vaultPayload = JSON.parse(vaultString);
        const decryptedJson = await CryptoService.decrypt(vaultPayload, pin);
        this.data = JSON.parse(decryptedJson);
      } catch (err) {
        console.error('Decryption error during unlock:', err);
        throw new Error('CORRUPTED_OR_WRONG_PIN');
      }
    } else {
      // Initial empty state
      this.data = {
        members: [],
        transactions: [],
        settings: {
          currency: '₹',
          theme: 'dark',
          autoLockMinutes: 5
        }
      };
      await this.save();
    }

    this.isUnlocked = true;
    this.resetAutoLockTimer();
    return true;
  }

  /**
   * Lock the app immediately
   */
  lock() {
    this.sessionPin = null;
    this.isUnlocked = false;
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  /**
   * Reset activity timer for auto-lock
   */
  resetAutoLockTimer() {
    if (this.autoLockTimer) clearTimeout(this.autoLockTimer);
    const minutes = (this.data.settings && this.data.settings.autoLockMinutes) || 5;
    this.autoLockTimer = setTimeout(() => {
      if (this.isUnlocked) {
        this.lock();
        if (window.app) window.app.showLockScreen();
      }
    }, minutes * 60 * 1000);
  }

  /**
   * Save current state encrypted in localStorage
   */
  async save() {
    if (!this.sessionPin) return false;

    try {
      const plainJson = JSON.stringify(this.data);
      const encryptedPayload = await CryptoService.encrypt(plainJson, this.sessionPin);
      localStorage.setItem('khatu_vault', JSON.stringify(encryptedPayload));
      localStorage.setItem('khatu_last_saved', new Date().toISOString());
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    }
  }

  /**
   * Load Starter/Demo Data (Rameshbhai, Sureshbhai, Maheshbhai)
   */
  async loadSampleData() {
    try {
      const resp = await fetch('data/sample_data.json');
      if (resp.ok) {
        const sample = await resp.json();
        if (sample.members && sample.transactions) {
          this.data.members = sample.members;
          this.data.transactions = sample.transactions;
          await this.save();
          return true;
        }
      }
    } catch (e) {
      console.warn('Could not fetch sample_data.json directly, using fallback fallback data.', e);
    }

    // Fallback embedded sample data matching user's exact specification
    this.data.members = [
      {
        id: 'mem_ramesh',
        name: 'રમેશભાઈ (Rameshbhai)',
        phone: '9898012345',
        notes: 'દુકાન પાડોશી',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mem_suresh',
        name: 'સુરેશભાઈ (Sureshbhai)',
        phone: '9825067890',
        notes: 'ઓફિસ મિત્ર',
        createdAt: new Date().toISOString()
      }
    ];

    this.data.transactions = [
      {
        id: 'txn_001',
        memberId: 'mem_ramesh',
        type: 'GIVE',
        amount: 5000,
        date: new Date().toISOString().split('T')[0],
        note: 'ઉછીના આપ્યા',
        createdAt: new Date().toISOString()
      },
      {
        id: 'txn_002',
        memberId: 'mem_ramesh',
        type: 'TAKE',
        amount: 3000,
        date: new Date().toISOString().split('T')[0],
        note: 'જમા કર્યા (રોકડા)',
        createdAt: new Date().toISOString()
      }
    ];

    await this.save();
    return true;
  }

  // ================= MEMBER & TRANSACTION CRUD ================= //

  getMembers() {
    return this.data.members || [];
  }

  getMemberById(id) {
    return (this.data.members || []).find(m => m.id === id);
  }

  async addMember({ name, phone, notes }) {
    const id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newMember = {
      id,
      name: name.trim(),
      phone: (phone || '').trim(),
      notes: (notes || '').trim(),
      createdAt: new Date().toISOString()
    };
    this.data.members.unshift(newMember);
    await this.save();
    return newMember;
  }

  async updateMember(id, { name, phone, notes }) {
    const member = this.getMemberById(id);
    if (!member) return null;
    member.name = name.trim();
    member.phone = (phone || '').trim();
    member.notes = (notes || '').trim();
    member.updatedAt = new Date().toISOString();
    await this.save();
    return member;
  }

  async deleteMember(id) {
    this.data.members = (this.data.members || []).filter(m => m.id !== id);
    this.data.transactions = (this.data.transactions || []).filter(t => t.memberId !== id);
    await this.save();
    return true;
  }

  getTransactions(memberId = null) {
    let list = this.data.transactions || [];
    if (memberId) {
      list = list.filter(t => t.memberId === memberId);
    }
    // Sort descending by date & created
    return list.slice().sort((a, b) => {
      const dateA = new Date(a.date + ' ' + (a.time || '00:00')).getTime();
      const dateB = new Date(b.date + ' ' + (b.time || '00:00')).getTime();
      return dateB - dateA;
    });
  }

  getTransactionById(id) {
    return (this.data.transactions || []).find(t => t.id === id);
  }

  async addTransaction({ memberId, type, amount, date, note }) {
    const id = 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    const newTxn = {
      id,
      memberId,
      type, // 'GIVE' (આપ્યા / દીધા) or 'TAKE' (લીધા / જમા)
      amount: Math.abs(parseFloat(amount) || 0),
      date: date || now.toISOString().split('T')[0],
      time: timeStr,
      note: (note || '').trim(),
      createdAt: now.toISOString()
    };

    this.data.transactions.unshift(newTxn);
    await this.save();
    return newTxn;
  }

  async updateTransaction(id, { memberId, type, amount, date, note }) {
    const txn = this.getTransactionById(id);
    if (!txn) return null;

    txn.memberId = memberId;
    txn.type = type;
    txn.amount = Math.abs(parseFloat(amount) || 0);
    txn.date = date;
    txn.note = (note || '').trim();
    txn.updatedAt = new Date().toISOString();

    await this.save();
    return txn;
  }

  async deleteTransaction(id) {
    this.data.transactions = (this.data.transactions || []).filter(t => t.id !== id);
    await this.save();
    return true;
  }

  // ================= FINANCIAL CALCULATIONS ================= //

  /**
   * Calculate exact balance for a specific member
   * GIVE (મેં આપ્યા): money left my pocket -> user owes me (+ balance, "લેવાના")
   * TAKE (મેં લીધા / જમા): money entered my pocket -> returned or borrowed (- balance)
   */
  getMemberBalance(memberId) {
    const txns = this.getTransactions(memberId);
    let totalGiven = 0;
    let totalReceived = 0;

    txns.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'GIVE') {
        totalGiven += amt;
      } else if (t.type === 'TAKE') {
        totalReceived += amt;
      }
    });

    const net = totalGiven - totalReceived;
    let status = 'SETTLED'; // 0
    if (net > 0) {
      status = 'RECEIVE'; // લેવાના છે
    } else if (net < 0) {
      status = 'PAY';     // દેવાના છે
    }

    return {
      totalGiven,
      totalReceived,
      netBalance: net,
      absoluteBalance: Math.abs(net),
      status, // 'RECEIVE' | 'PAY' | 'SETTLED'
      transactionCount: txns.length
    };
  }

  /**
   * Calculate overall system stats
   */
  getOverallStats() {
    let totalToReceive = 0;
    let totalToPay = 0;
    const members = this.getMembers();

    members.forEach(m => {
      const bal = this.getMemberBalance(m.id);
      if (bal.status === 'RECEIVE') {
        totalToReceive += bal.absoluteBalance;
      } else if (bal.status === 'PAY') {
        totalToPay += bal.absoluteBalance;
      }
    });

    return {
      totalToReceive,
      totalToPay,
      netMarketBalance: totalToReceive - totalToPay,
      totalMembers: members.length,
      totalTransactions: (this.data.transactions || []).length
    };
  }

  // ================= EXPORT & IMPORT ================= //

  /**
   * Export JSON Backup (Encrypted or Plain)
   */
  async exportJSON(encrypted = true) {
    let exportObj;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    if (encrypted) {
      const plainJson = JSON.stringify(this.data);
      const encryptedPayload = await CryptoService.encrypt(plainJson, this.sessionPin);
      exportObj = {
        app: 'KhatuMoneyManager',
        format: 'khatu-encrypted-vault',
        version: '1.0.0',
        exportedAt: now.toISOString(),
        note: 'Encrypted with your PIN. Secure for cloud/git storage.',
        payload: encryptedPayload
      };
    } else {
      exportObj = {
        app: 'KhatuMoneyManager',
        format: 'khatu-plain-data',
        version: '1.0.0',
        exportedAt: now.toISOString(),
        currency: '₹',
        members: this.data.members,
        transactions: this.data.transactions
      };
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const filename = `money_backup_${encrypted ? 'encrypted_' : 'plain_'}${dateStr}.json`;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    return filename;
  }

  /**
   * Import JSON Backup file
   */
  async importJSON(fileString, pinForDecryption = null) {
    try {
      const json = JSON.parse(fileString);

      // Scenario 1: Encrypted Khatu Vault
      if (json.format === 'khatu-encrypted-vault' && json.payload) {
        const pinToUse = pinForDecryption || this.sessionPin;
        if (!pinToUse) throw new Error('PIN_REQUIRED');

        const decryptedStr = await CryptoService.decrypt(json.payload, pinToUse);
        const importedData = JSON.parse(decryptedStr);

        this.data.members = importedData.members || [];
        this.data.transactions = importedData.transactions || [];
        await this.save();
        return { success: true, count: this.data.members.length };
      }

      // Scenario 2: Plain Khatu JSON or sample_data.json
      if (json.members && Array.isArray(json.members)) {
        this.data.members = json.members;
        this.data.transactions = json.transactions || [];
        await this.save();
        return { success: true, count: this.data.members.length };
      }

      throw new Error('UNKNOWN_FORMAT');
    } catch (err) {
      console.error('Import error:', err);
      throw err;
    }
  }

  /**
   * Reset all data (factory reset)
   */
  async resetAll() {
    localStorage.removeItem('khatu_vault');
    localStorage.removeItem('khatu_pin_hash');
    localStorage.removeItem('khatu_pin_salt');
    localStorage.removeItem('khatu_last_saved');
    this.sessionPin = null;
    this.isUnlocked = false;
    this.data = { members: [], transactions: [], settings: {} };
    return true;
  }
}

window.StorageService = new StorageService();
