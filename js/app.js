/**
 * App - Main UI Controller for Khatu Money Management
 */
class KhatuApp {
  constructor() {
    this.currentView = 'home';
    this.activeMemberId = null;
    this.activeFilter = 'ALL'; // ALL, RECEIVE, PAY, SETTLED
    this.searchQuery = '';
    this.editingTxnId = null;
    this.editingMemberId = null;
  }

  async init() {
    // 1. Initialize language
    window.i18n.updateDOM();

    // 2. Initialize theme
    this.initTheme();

    // 3. Bind Global Events
    this.bindEvents();

    // 4. Check PIN lock state
    if (window.StorageService.hasPinConfigured()) {
      this.showLockScreen(false);
    } else {
      // First time user setup
      this.showLockScreen(true);
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('khatu_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton(savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('khatu_theme', next);
    this.updateThemeButton(next);
  }

  updateThemeButton(theme) {
    const btn = document.getElementById('btnThemeToggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' 
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  // ================= PIN & LOCK SYSTEM ================= //

  showLockScreen(isFirstTime = false) {
    const lockScreen = document.getElementById('lockScreen');
    const mainApp = document.getElementById('mainApp');
    const pinTitle = document.getElementById('pinTitle');
    const pinSubtitle = document.getElementById('pinSubtitle');
    const pinConfirmGroup = document.getElementById('pinConfirmGroup');
    const pinInput = document.getElementById('pinInput');
    const pinConfirm = document.getElementById('pinConfirm');
    const pinError = document.getElementById('pinError');

    lockScreen.style.display = 'flex';
    mainApp.style.display = 'none';
    pinInput.value = '';
    if (pinConfirm) pinConfirm.value = '';
    pinError.innerText = '';

    if (isFirstTime) {
      pinTitle.innerText = window.i18n.t('setPin');
      pinSubtitle.innerText = 'તમારા નાણાકીય હિસાબને સુરક્ષિત રાખવા માટે 4-અંકનો PIN બનાવો.';
      pinConfirmGroup.style.display = 'block';
    } else {
      pinTitle.innerText = window.i18n.t('enterPin');
      pinSubtitle.innerText = 'તમારા ખાતામાં પ્રવેશવા માટે 4-અંકનો PIN દાખલ કરો.';
      pinConfirmGroup.style.display = 'none';
    }

    setTimeout(() => pinInput.focus(), 300);
  }

  async handlePinSubmit(e) {
    e.preventDefault();
    const pinInput = document.getElementById('pinInput');
    const pinConfirm = document.getElementById('pinConfirm');
    const pinError = document.getElementById('pinError');
    const pin = pinInput.value.trim();

    pinError.innerText = '';

    if (pin.length < 4) {
      pinError.innerText = window.i18n.t('pinLength');
      return;
    }

    const isFirstTime = !window.StorageService.hasPinConfigured();

    if (isFirstTime) {
      const confirm = pinConfirm.value.trim();
      if (pin !== confirm) {
        pinError.innerText = window.i18n.t('pinMismatch');
        return;
      }

      try {
        await window.StorageService.setupPin(pin);
        // Automatically preload sample data if completely fresh
        await window.StorageService.loadSampleData();
        this.unlockSuccess();
      } catch (err) {
        pinError.innerText = err.message || 'Error saving PIN';
      }
    } else {
      try {
        await window.StorageService.unlock(pin);
        this.unlockSuccess();
      } catch (err) {
        pinError.innerText = window.i18n.t('wrongPin');
        pinInput.value = '';
        pinInput.focus();
      }
    }
  }

  unlockSuccess() {
    document.getElementById('lockScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    this.renderCurrentView();
    this.showToast('સફળતાપૂર્વક અનલૉક થયું!', 'success');
  }

  lockNow() {
    window.StorageService.lock();
    this.showLockScreen(false);
  }

  // ================= VIEW SWITCHING ================= //

  switchView(viewName) {
    this.currentView = viewName;

    // Update bottom nav items
    document.querySelectorAll('.nav-tab').forEach(tab => {
      if (tab.getAttribute('data-view') === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Hide all view screens
    document.querySelectorAll('.view-screen').forEach(scr => {
      scr.classList.remove('active');
    });

    // Show target view
    const targetScreen = document.getElementById(`view-${viewName}`);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.renderCurrentView();
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'home':
        this.renderHome();
        break;
      case 'member-detail':
        this.renderMemberDetail();
        break;
      case 'transactions':
        this.renderAllTransactions();
        break;
      case 'analytics':
        this.renderAnalytics();
        break;
      case 'settings':
        this.renderSettings();
        break;
      default:
        this.renderHome();
    }
  }

  // ================= HOME VIEW (MEMBERS LIST & STATS) ================= //

  renderHome() {
    // 1. Render Summary Cards
    const stats = window.StorageService.getOverallStats();
    document.getElementById('statTotalReceive').innerText = `₹${stats.totalToReceive.toLocaleString('en-IN')}`;
    document.getElementById('statTotalPay').innerText = `₹${stats.totalToPay.toLocaleString('en-IN')}`;
    document.getElementById('statNetBalance').innerText = `₹${Math.abs(stats.netMarketBalance).toLocaleString('en-IN')}`;
    
    const netBadge = document.getElementById('statNetBadge');
    if (stats.netMarketBalance > 0) {
      netBadge.className = 'badge badge-success';
      netBadge.innerText = window.i18n.t('toReceive');
    } else if (stats.netMarketBalance < 0) {
      netBadge.className = 'badge badge-danger';
      netBadge.innerText = window.i18n.t('toPay');
    } else {
      netBadge.className = 'badge badge-neutral';
      netBadge.innerText = window.i18n.t('settled');
    }

    // 2. Render Member List
    const members = window.StorageService.getMembers();
    const memberContainer = document.getElementById('membersListContainer');

    if (!members || members.length === 0) {
      memberContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>${window.i18n.t('noMembers')}</h3>
          <p class="text-muted">તમે જેમની સાથે વ્યવહાર કરવા માંગો છો તેવા વ્યક્તિને ઉમેરો.</p>
          <div class="btn-group">
            <button class="btn btn-primary" onclick="app.openAddMemberModal()">+ ${window.i18n.t('addMember')}</button>
            <button class="btn btn-secondary" onclick="app.loadDemoData()">🚀 ${window.i18n.t('sampleData')}</button>
          </div>
        </div>
      `;
      return;
    }

    // Filter members
    const filtered = members.filter(m => {
      const bal = window.StorageService.getMemberBalance(m.id);
      
      // Status filter
      if (this.activeFilter === 'RECEIVE' && bal.status !== 'RECEIVE') return false;
      if (this.activeFilter === 'PAY' && bal.status !== 'PAY') return false;
      if (this.activeFilter === 'SETTLED' && bal.status !== 'SETTLED') return false;

      // Search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchPhone = (m.phone || '').includes(q);
        const matchNote = (m.notes || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchNote;
      }
      return true;
    });

    if (filtered.length === 0) {
      memberContainer.innerHTML = `
        <div class="empty-state">
          <p class="text-muted">આ ફિલ્ટરમાં કોઈ સભ્ય મળ્યા નથી.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(m => {
      const bal = window.StorageService.getMemberBalance(m.id);
      const initial = m.name ? m.name.trim().charAt(0).toUpperCase() : '?';

      let statusBadgeClass = 'badge-neutral';
      let statusText = window.i18n.t('settled');
      let amountClass = 'color-neutral';

      if (bal.status === 'RECEIVE') {
        statusBadgeClass = 'badge-success';
        statusText = window.i18n.t('toReceive');
        amountClass = 'color-success';
      } else if (bal.status === 'PAY') {
        statusBadgeClass = 'badge-danger';
        statusText = window.i18n.t('toPay');
        amountClass = 'color-danger';
      }

      html += `
        <div class="member-card" onclick="app.viewMemberDetail('${m.id}')">
          <div class="member-avatar">${initial}</div>
          <div class="member-info">
            <div class="member-name-row">
              <h4 class="member-name">${this.escapeHtml(m.name)}</h4>
              <span class="badge ${statusBadgeClass}">${statusText}</span>
            </div>
            <div class="member-meta-row">
              <span class="member-phone">${m.phone ? '📞 ' + this.escapeHtml(m.phone) : (m.notes ? this.escapeHtml(m.notes) : 'કોઈ વિગત નથી')}</span>
              <span class="member-txns-count">${bal.transactionCount} વ્યવહાર</span>
            </div>
          </div>
          <div class="member-amount-col">
            <div class="member-amount ${amountClass}">₹${bal.absoluteBalance.toLocaleString('en-IN')}</div>
            <div class="member-status-sub">${bal.status === 'RECEIVE' ? 'લેવાના' : (bal.status === 'PAY' ? 'દેવાના' : 'સરભર')}</div>
          </div>
          <div class="member-arrow">›</div>
        </div>
      `;
    });

    memberContainer.innerHTML = html;
  }

  // ================= MEMBER DETAIL / LEDGER VIEW ================= //

  viewMemberDetail(memberId) {
    this.activeMemberId = memberId;
    this.switchView('member-detail');
  }

  renderMemberDetail() {
    const member = window.StorageService.getMemberById(this.activeMemberId);
    if (!member) {
      this.switchView('home');
      return;
    }

    const bal = window.StorageService.getMemberBalance(member.id);
    const txns = window.StorageService.getTransactions(member.id);

    // Set Header
    document.getElementById('detailMemberName').innerText = member.name;
    document.getElementById('detailMemberPhone').innerText = member.phone ? `📞 ${member.phone}` : (member.notes || '');

    // Set Big Balance Card
    const cardEl = document.getElementById('detailBalanceCard');
    const statusTextEl = document.getElementById('detailStatusText');
    const amountEl = document.getElementById('detailBalanceAmount');
    const subNoteEl = document.getElementById('detailBalanceSubNote');

    amountEl.innerText = `₹${bal.absoluteBalance.toLocaleString('en-IN')}`;

    if (bal.status === 'RECEIVE') {
      cardEl.className = 'balance-card-banner receive-banner';
      statusTextEl.innerText = `હજુ ₹${bal.absoluteBalance.toLocaleString('en-IN')} લેવાના છે`;
      subNoteEl.innerText = `${member.name} પાસેથી આ રકમ મેળવવાની બાકી છે.`;
    } else if (bal.status === 'PAY') {
      cardEl.className = 'balance-card-banner pay-banner';
      statusTextEl.innerText = `હજુ ₹${bal.absoluteBalance.toLocaleString('en-IN')} દેવાના છે`;
      subNoteEl.innerText = `${member.name} ને આ રકમ ચૂકવવાની બાકી છે.`;
    } else {
      cardEl.className = 'balance-card-banner settled-banner';
      statusTextEl.innerText = 'તમામ હિસાબ સરભર (ક્લિયર) છે!';
      subNoteEl.innerText = 'કોઈ લેતી-દેતી બાકી નથી.';
    }

    // Set Breakdown Stats
    document.getElementById('detailTotalGiven').innerText = `₹${bal.totalGiven.toLocaleString('en-IN')}`;
    document.getElementById('detailTotalReceived').innerText = `₹${bal.totalReceived.toLocaleString('en-IN')}`;
    document.getElementById('detailTxnCount').innerText = `${bal.transactionCount} વખત`;

    // WhatsApp Reminder Button
    const waBtn = document.getElementById('detailBtnWhatsApp');
    if (waBtn) {
      if (bal.status === 'SETTLED' || !member.phone) {
        waBtn.style.opacity = '0.5';
      } else {
        waBtn.style.opacity = '1';
      }
    }

    // Render Transaction History (Chronological running balance)
    const txnsListEl = document.getElementById('detailTxnsList');
    if (!txns || txns.length === 0) {
      txnsListEl.innerHTML = `
        <div class="empty-state-small">
          <p class="text-muted">${window.i18n.t('noTransactions')}</p>
        </div>
      `;
      return;
    }

    // Calculate running balance for each transaction chronologically (oldest to newest)
    const reversedChronological = txns.slice().reverse();
    let currentRun = 0;
    const runningBalances = {};

    reversedChronological.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'GIVE') {
        currentRun += amt;
      } else {
        currentRun -= amt;
      }
      runningBalances[t.id] = currentRun;
    });

    let txnsHtml = '';
    txns.forEach(t => {
      const isGive = t.type === 'GIVE';
      const typeBadgeClass = isGive ? 'badge-danger-soft' : 'badge-success-soft';
      const typeText = isGive ? 'મેં આપ્યા / દીધા' : 'મેં લીધા / જમા થયા';
      const amountSign = isGive ? '- ' : '+ ';
      const amountColor = isGive ? 'color-danger' : 'color-success';
      const runBal = runningBalances[t.id];
      const runBalText = runBal > 0 ? `લેવાના: ₹${runBal}` : (runBal < 0 ? `દેવાના: ₹${Math.abs(runBal)}` : 'સરભર');

      txnsHtml += `
        <div class="transaction-item">
          <div class="txn-icon ${isGive ? 'txn-out' : 'txn-in'}">
            ${isGive ? '📤' : '📥'}
          </div>
          <div class="txn-content">
            <div class="txn-header-row">
              <span class="badge ${typeBadgeClass}">${typeText}</span>
              <span class="txn-amount ${amountColor}">₹${Number(t.amount).toLocaleString('en-IN')}</span>
            </div>
            <div class="txn-note">${this.escapeHtml(t.note || (isGive ? 'રોકડ આપ્યા' : 'જમા થયા'))}</div>
            <div class="txn-footer-row">
              <span class="txn-date">📅 ${t.date} ${t.time ? '• ' + t.time : ''}</span>
              <span class="txn-running-balance">હિસાબ: <strong>${runBalText}</strong></span>
            </div>
          </div>
          <div class="txn-actions">
            <button class="btn-icon" title="ફેરફાર" onclick="app.openEditTxnModal('${t.id}')">✏️</button>
            <button class="btn-icon" title="ડીલીટ" onclick="app.deleteTxn('${t.id}')">🗑️</button>
          </div>
        </div>
      `;
    });

    txnsListEl.innerHTML = txnsHtml;
  }

  // ================= TRANSACTIONS VIEW ================= //

  renderAllTransactions() {
    const txns = window.StorageService.getTransactions();
    const container = document.getElementById('allTransactionsList');

    if (!txns || txns.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p class="text-muted">${window.i18n.t('noTransactions')}</p>
        </div>
      `;
      return;
    }

    let html = '';
    txns.forEach(t => {
      const member = window.StorageService.getMemberById(t.memberId);
      const memberName = member ? member.name : 'Unknown';
      const isGive = t.type === 'GIVE';

      html += `
        <div class="transaction-item" onclick="app.viewMemberDetail('${t.memberId}')">
          <div class="txn-icon ${isGive ? 'txn-out' : 'txn-in'}">
            ${isGive ? '📤' : '📥'}
          </div>
          <div class="txn-content">
            <div class="txn-header-row">
              <strong class="txn-member-title">${this.escapeHtml(memberName)}</strong>
              <span class="txn-amount ${isGive ? 'color-danger' : 'color-success'}">
                ₹${Number(t.amount).toLocaleString('en-IN')}
              </span>
            </div>
            <div class="txn-note">${this.escapeHtml(t.note || (isGive ? 'આપ્યા' : 'જમા કર્યા'))}</div>
            <div class="txn-footer-row">
              <span class="badge ${isGive ? 'badge-danger-soft' : 'badge-success-soft'}">${isGive ? 'આપ્યા' : 'જમા'}</span>
              <span class="txn-date">📅 ${t.date}</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ================= ANALYTICS VIEW ================= //

  renderAnalytics() {
    const stats = window.StorageService.getOverallStats();
    const members = window.StorageService.getMembers();

    document.getElementById('analyticsTotalToReceive').innerText = `₹${stats.totalToReceive.toLocaleString('en-IN')}`;
    document.getElementById('analyticsTotalToPay').innerText = `₹${stats.totalToPay.toLocaleString('en-IN')}`;
    document.getElementById('analyticsTotalMembers').innerText = stats.totalMembers;
    document.getElementById('analyticsTotalTxns').innerText = stats.totalTransactions;

    // Top Debtors (Who owes you the most)
    const debtors = [];
    const creditors = [];

    members.forEach(m => {
      const bal = window.StorageService.getMemberBalance(m.id);
      if (bal.status === 'RECEIVE') {
        debtors.push({ name: m.name, amount: bal.absoluteBalance });
      } else if (bal.status === 'PAY') {
        creditors.push({ name: m.name, amount: bal.absoluteBalance });
      }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debtorsListEl = document.getElementById('topDebtorsList');
    if (debtors.length === 0) {
      debtorsListEl.innerHTML = '<p class="text-muted">હાલ કોઈ લેવાના બાકી નથી.</p>';
    } else {
      debtorsListEl.innerHTML = debtors.slice(0, 5).map(d => `
        <div class="analytics-row">
          <span>${this.escapeHtml(d.name)}</span>
          <strong class="color-success">₹${d.amount.toLocaleString('en-IN')}</strong>
        </div>
      `).join('');
    }

    const creditorsListEl = document.getElementById('topCreditorsList');
    if (creditors.length === 0) {
      creditorsListEl.innerHTML = '<p class="text-muted">હાલ કોઈ દેવાના બાકી નથી.</p>';
    } else {
      creditorsListEl.innerHTML = creditors.slice(0, 5).map(c => `
        <div class="analytics-row">
          <span>${this.escapeHtml(c.name)}</span>
          <strong class="color-danger">₹${c.amount.toLocaleString('en-IN')}</strong>
        </div>
      `).join('');
    }
  }

  // ================= SETTINGS VIEW ================= //

  renderSettings() {
    const lastSaved = localStorage.getItem('khatu_last_saved');
    const lastSavedEl = document.getElementById('settingsLastSaved');
    if (lastSavedEl && lastSaved) {
      const d = new Date(lastSaved);
      lastSavedEl.innerText = d.toLocaleString('gu-IN');
    }
  }

  // ================= MODAL HANDLERS ================= //

  openAddMemberModal(memberId = null) {
    this.editingMemberId = memberId;
    const modal = document.getElementById('modalMember');
    const title = document.getElementById('modalMemberTitle');
    const nameInput = document.getElementById('memberInputName');
    const phoneInput = document.getElementById('memberInputPhone');
    const notesInput = document.getElementById('memberInputNotes');

    if (memberId) {
      const member = window.StorageService.getMemberById(memberId);
      title.innerText = 'સભ્યમાં ફેરફાર કરો';
      nameInput.value = member.name;
      phoneInput.value = member.phone || '';
      notesInput.value = member.notes || '';
    } else {
      title.innerText = window.i18n.t('addMember');
      nameInput.value = '';
      phoneInput.value = '';
      notesInput.value = '';
    }

    modal.classList.add('active');
    setTimeout(() => nameInput.focus(), 200);
  }

  closeMemberModal() {
    document.getElementById('modalMember').classList.remove('active');
    this.editingMemberId = null;
  }

  async handleSaveMember(e) {
    e.preventDefault();
    const name = document.getElementById('memberInputName').value.trim();
    const phone = document.getElementById('memberInputPhone').value.trim();
    const notes = document.getElementById('memberInputNotes').value.trim();

    if (!name) {
      alert('કૃપા કરીને સભ્યનું નામ દાખલ કરો');
      return;
    }

    if (this.editingMemberId) {
      await window.StorageService.updateMember(this.editingMemberId, { name, phone, notes });
      this.showToast('સભ્યની વિગત અપડેટ થઈ ગઈ!', 'success');
    } else {
      const newMem = await window.StorageService.addMember({ name, phone, notes });
      this.showToast('નવા સભ્ય ઉમેરાઈ ગયા!', 'success');
      // If we were on member detail, stay, else open that member
      this.activeMemberId = newMem.id;
    }

    this.closeMemberModal();
    this.renderCurrentView();
  }

  async deleteActiveMember() {
    if (!this.activeMemberId) return;
    const member = window.StorageService.getMemberById(this.activeMemberId);
    if (!member) return;

    const bal = window.StorageService.getMemberBalance(member.id);
    let confirmMsg = `${member.name} ને ડીલીટ કરવા માંગો છો?`;
    if (bal.absoluteBalance > 0) {
      confirmMsg += `\nધ્યાન આપો: આ સભ્ય પાસે હજુ ₹${bal.absoluteBalance} નો હિસાબ બાકી છે!`;
    }

    if (confirm(confirmMsg)) {
      await window.StorageService.deleteMember(member.id);
      this.showToast('સભ્ય ડીલીટ થઈ ગયા!', 'info');
      this.activeMemberId = null;
      this.switchView('home');
    }
  }

  // ================= TRANSACTION MODAL ================= //

  openAddTxnModal(defaultType = 'GIVE', preselectedMemberId = null) {
    this.editingTxnId = null;
    const modal = document.getElementById('modalTransaction');
    const title = document.getElementById('modalTxnTitle');
    const memberSelect = document.getElementById('txnSelectMember');
    const amountInput = document.getElementById('txnInputAmount');
    const dateInput = document.getElementById('txnInputDate');
    const noteInput = document.getElementById('txnInputNote');
    const typeGive = document.getElementById('txnTypeGive');
    const typeTake = document.getElementById('txnTypeTake');

    title.innerText = window.i18n.t('addTransaction');
    amountInput.value = '';
    noteInput.value = '';
    dateInput.value = new Date().toISOString().split('T')[0];

    // Populate members dropdown
    const members = window.StorageService.getMembers();
    if (members.length === 0) {
      alert('પહેલા સભ્ય ઉમેરો!');
      this.openAddMemberModal();
      return;
    }

    memberSelect.innerHTML = members.map(m => `
      <option value="${m.id}" ${(preselectedMemberId || this.activeMemberId) === m.id ? 'selected' : ''}>
        ${this.escapeHtml(m.name)}
      </option>
    `).join('');

    if (defaultType === 'GIVE') {
      typeGive.checked = true;
    } else {
      typeTake.checked = true;
    }

    modal.classList.add('active');
    setTimeout(() => amountInput.focus(), 200);
  }

  openEditTxnModal(txnId) {
    const txn = window.StorageService.getTransactionById(txnId);
    if (!txn) return;

    this.editingTxnId = txnId;
    const modal = document.getElementById('modalTransaction');
    const title = document.getElementById('modalTxnTitle');
    const memberSelect = document.getElementById('txnSelectMember');
    const amountInput = document.getElementById('txnInputAmount');
    const dateInput = document.getElementById('txnInputDate');
    const noteInput = document.getElementById('txnInputNote');
    const typeGive = document.getElementById('txnTypeGive');
    const typeTake = document.getElementById('txnTypeTake');

    title.innerText = 'વ્યવહારમાં ફેરફાર કરો';
    amountInput.value = txn.amount;
    noteInput.value = txn.note || '';
    dateInput.value = txn.date || new Date().toISOString().split('T')[0];

    const members = window.StorageService.getMembers();
    memberSelect.innerHTML = members.map(m => `
      <option value="${m.id}" ${txn.memberId === m.id ? 'selected' : ''}>
        ${this.escapeHtml(m.name)}
      </option>
    `).join('');

    if (txn.type === 'GIVE') {
      typeGive.checked = true;
    } else {
      typeTake.checked = true;
    }

    modal.classList.add('active');
    setTimeout(() => amountInput.focus(), 200);
  }

  closeTxnModal() {
    document.getElementById('modalTransaction').classList.remove('active');
    this.editingTxnId = null;
  }

  async handleSaveTxn(e) {
    e.preventDefault();
    const memberId = document.getElementById('txnSelectMember').value;
    const amount = parseFloat(document.getElementById('txnInputAmount').value);
    const date = document.getElementById('txnInputDate').value;
    const note = document.getElementById('txnInputNote').value.trim();
    const type = document.querySelector('input[name="txnType"]:checked').value;

    if (!memberId) {
      alert('કૃપા કરીને સભ્ય પસંદ કરો');
      return;
    }

    if (!amount || amount <= 0) {
      alert('કૃપા કરીને માન્ય રકમ દાખલ કરો');
      return;
    }

    if (this.editingTxnId) {
      await window.StorageService.updateTransaction(this.editingTxnId, { memberId, type, amount, date, note });
      this.showToast('વ્યવહાર અપડેટ થઈ ગયો!', 'success');
    } else {
      await window.StorageService.addTransaction({ memberId, type, amount, date, note });
      this.showToast('વ્યવહાર ઉમેરાઈ ગયો!', 'success');
    }

    this.closeTxnModal();
    this.renderCurrentView();
  }

  async deleteTxn(txnId) {
    if (confirm(window.i18n.t('confirmDeleteTxn'))) {
      await window.StorageService.deleteTransaction(txnId);
      this.showToast('વ્યવહાર ડીલીટ થઈ ગયો!', 'info');
      this.renderCurrentView();
    }
  }

  /**
   * One-click Settle Up: Exactly clear the remaining balance!
   */
  async quickSettleActiveMember() {
    if (!this.activeMemberId) return;
    const member = window.StorageService.getMemberById(this.activeMemberId);
    if (!member) return;

    const bal = window.StorageService.getMemberBalance(member.id);
    if (bal.status === 'SETTLED' || bal.absoluteBalance === 0) {
      alert('આ સભ્યનો હિસાબ પહેલેથી જ સરભર છે!');
      return;
    }

    // If we have to receive (RECEIVE), settle means they pay us -> TAKE
    // If we have to pay (PAY), settle means we pay them -> GIVE
    const type = bal.status === 'RECEIVE' ? 'TAKE' : 'GIVE';
    const typeName = bal.status === 'RECEIVE' ? 'જમા કર્યા (લીધા)' : 'ચૂકવ્યા (આપ્યા)';

    if (confirm(`શું ${member.name} સાથે પૂરેપૂરો હિસાબ ₹${bal.absoluteBalance} ${typeName} તરીકે સરભર (ક્લિયર) કરવો છે?`)) {
      await window.StorageService.addTransaction({
        memberId: member.id,
        type: type,
        amount: bal.absoluteBalance,
        date: new Date().toISOString().split('T')[0],
        note: 'હિસાબ પૂરેપૂરો સરભર / ચુકતે કર્યો'
      });

      this.showToast('હિસાબ સફળતાપૂર્વક સરભર થઈ ગયો!', 'success');
      this.renderCurrentView();
    }
  }

  // ================= WHATSAPP REMINDER ================= //

  sendWhatsAppReminder() {
    if (!this.activeMemberId) return;
    const member = window.StorageService.getMemberById(this.activeMemberId);
    if (!member) return;

    const bal = window.StorageService.getMemberBalance(member.id);
    if (bal.status === 'SETTLED') {
      alert('હિસાબ સરભર છે, રીમાઇન્ડરની જરૂર નથી.');
      return;
    }

    const isReceive = bal.status === 'RECEIVE';
    const message = window.i18n.t('waReminderMessage', member.name, bal.absoluteBalance.toLocaleString('en-IN'), isReceive);

    let phone = (member.phone || '').replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = '91' + phone; // Add India country code if 10 digit
    }

    const waUrl = phone 
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  }

  callActiveMember() {
    if (!this.activeMemberId) return;
    const member = window.StorageService.getMemberById(this.activeMemberId);
    if (!member || !member.phone) {
      alert('આ સભ્યનો મોબાઈલ નંબર નોંધાયેલ નથી!');
      return;
    }
    window.location.href = `tel:${member.phone}`;
  }

  // ================= BACKUP & EXPORT/IMPORT ================= //

  async exportEncrypted() {
    const filename = await window.StorageService.exportJSON(true);
    this.showToast(`સુરક્ષિત બેકઅપ ડાઉનલોડ થયું: ${filename}`, 'success');
  }

  async exportPlain() {
    if (confirm('ધ્યાન આપો: સામાન્ય JSON ફાઈલમાં તમામ નાણાકીય હિસાબ અન-એન્ક્રિપ્ટેડ લખાણમાં હશે. શું આગળ વધવું છે?')) {
      const filename = await window.StorageService.exportJSON(false);
      this.showToast(`JSON ફાઈલ ડાઉનલોડ થઈ: ${filename}`, 'info');
    }
  }

  triggerImportFile() {
    document.getElementById('importFileInput').click();
  }

  async handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target.result;
      try {
        await window.StorageService.importJSON(content);
        this.showToast(window.i18n.t('importSuccess'), 'success');
        this.renderCurrentView();
      } catch (err) {
        if (err.message === 'INVALID_PIN') {
          alert('આ બેકઅપ ફાઈલ અલગ PIN વડે લૉક થયેલી છે!');
        } else {
          alert(window.i18n.t('importError'));
        }
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  async loadDemoData() {
    if (confirm('શું ડેમો ડેટા (રમેશભાઈ વગેરે) લોડ કરવો છે?')) {
      await window.StorageService.loadSampleData();
      this.showToast('ડેમો ડેટા સફળતાપૂર્વક લોડ થયો!', 'success');
      this.renderCurrentView();
    }
  }

  async handleResetAll() {
    if (confirm('ચેતવણી: આનાથી તમામ સભ્યો, વ્યવહારો અને PIN કાયમ માટે ડીલીટ થઈ જશે! શું તમે ખરેખર આગળ વધવા માંગો છો?')) {
      await window.StorageService.resetAll();
      window.location.reload();
    }
  }

  // ================= UI HELPERS & EVENTS ================= //

  showToast(msg, type = 'info') {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    toast.innerText = msg;
    toast.className = `toast toast-${type} show`;
    setTimeout(() => {
      toast.className = 'toast';
    }, 3200);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  bindEvents() {
    // PIN Form
    document.getElementById('pinForm').addEventListener('submit', (e) => this.handlePinSubmit(e));

    // Nav Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = tab.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Theme & Lang
    document.getElementById('btnThemeToggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('btnLangToggle').addEventListener('click', () => {
      const nextLang = window.i18n.currentLang === 'gu' ? 'en' : 'gu';
      window.i18n.setLang(nextLang);
      this.renderCurrentView();
    });

    // Lock button
    document.getElementById('btnHeaderLock').addEventListener('click', () => this.lockNow());

    // Search input
    const searchInput = document.getElementById('searchInputMembers');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderHome();
      });
    }

    // Filter Chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.getAttribute('data-filter');
        this.renderHome();
      });
    });

    // Forms
    document.getElementById('formMember').addEventListener('submit', (e) => this.handleSaveMember(e));
    document.getElementById('formTransaction').addEventListener('submit', (e) => this.handleSaveTxn(e));

    // Import file listener
    document.getElementById('importFileInput').addEventListener('change', (e) => this.handleFileImport(e));

    // Reset auto-lock on user activity
    ['mousedown', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, () => window.StorageService.resetAutoLockTimer(), { passive: true });
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new KhatuApp();
  window.app.init();
});
