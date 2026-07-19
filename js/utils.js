export const DB_KEYS = {
  users: 'lms_users',
  books: 'lms_books',
  categories: 'lms_categories',
  orders: 'lms_orders',
  session: 'lms_currentUser'
};

export function dbGet(key){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Failed to read', key, e);
    return [];
  }
}

export function dbSet(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

export function nextId(list){
  if(!list.length) return 1;
  return Math.max(...list.map(i => Number(i.id) || 0)) + 1;
}

export function todayStr(){
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function escapeHtml(str){
  if(str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function statusBadge(status){
  const cls = (status || '').toLowerCase();
  return `<span class="badge-status ${cls}">${escapeHtml(status)}</span>`;
}

/* ---------- Toast notifications ---------- */
export function showToast(message, type = 'success'){
  const stack = document.getElementById('toastStack');
  if(!stack) return;

  const icons = {
    success: 'bi-check-circle-fill',
    danger: 'bi-x-circle-fill',
    info: 'bi-info-circle-fill'
  };

  const toast = document.createElement('div');
  toast.className = `lib-toast toast-${type}`;
  toast.innerHTML = `
    <i class="bi ${icons[type] || icons.success} toast-ic"></i>
    <span>${escapeHtml(message)}</span>
  `;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity .25s ease, transform .25s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

export function seedDatabase(){
  if(!localStorage.getItem(DB_KEYS.users)){
    dbSet(DB_KEYS.users, [
      { id: 1, name: 'Admin User', email: 'admin@library.com', password: 'admin123', role: 'Admin', joined: '2026-01-10' },
      { id: 2, name: 'Seng Dara', email: 'dara@library.com', password: 'member123', role: 'Member', joined: '2026-02-14' }
    ]);
  }

  if(!localStorage.getItem(DB_KEYS.categories)){
    dbSet(DB_KEYS.categories, [
      { id: 1, name: 'Fiction', description: 'Novels, short stories and literary works' },
      { id: 2, name: 'Science', description: 'Physics, biology, chemistry and technology' },
      { id: 3, name: 'History', description: 'World history and biographies' },
      { id: 4, name: 'Children', description: 'Picture books and young-reader titles' }
    ]);
  }

  if(!localStorage.getItem(DB_KEYS.books)){
    dbSet(DB_KEYS.books, [
      { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', quantity: 12 },
      { id: 2, title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', quantity: 6 },
      { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', quantity: 0 },
      { id: 4, title: 'Charlotte\'s Web', author: 'E. B. White', category: 'Children', quantity: 9 }
    ]);
  }

  if(!localStorage.getItem(DB_KEYS.orders)){
    dbSet(DB_KEYS.orders, [
      { id: 1, borrower: 'Seng Dara', book: 'The Great Gatsby', quantity: 1, date: '2026-05-31', status: 'Pending' }
    ]);
  }
}
