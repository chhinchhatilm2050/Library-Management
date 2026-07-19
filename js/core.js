export let CURRENT_USER = null;
export let DELETE_CONTEXT = null;
import { DB_KEYS, dbGet, dbSet, seedDatabase, showToast } from "./utils.js";
import { initBookForm, renderBooks } from "./books.js";
import { initCategoryForm } from "./categories.js";
import { initUserForm, renderUsers} from "./users.js";
import { initOrderForm, renderOrders } from "./orders.js";
import { renderDashboardStats } from "./dashboard.js";
import { renderCategories } from "./categories.js";


const VIEW_META = {
  dashboard:  { title: 'DASHBOARD',  sub: 'Library overview' },
  books:      { title: 'BOOKS',      sub: 'Manage your library catalog' },
  categories: { title: 'CATEGORIES', sub: 'Organize books by category' },
  orders:     { title: 'ORDERS',     sub: 'Manage borrow & return requests' },
  users:      { title: 'USERS',      sub: 'Manage member & staff accounts' }
};

document.addEventListener('DOMContentLoaded', () => {
  seedDatabase();
  const sessionRaw = localStorage.getItem(DB_KEYS.session);
  if(!sessionRaw){
    window.location.href = 'index.html';
    return;
  }
  CURRENT_USER = JSON.parse(sessionRaw);

  initUserChip();
  initNavigation();
  initHamburger();
  initLogout();
  initModalClosers();
  initSearchBoxes();
  initBookForm();
  initCategoryForm();
  initOrderForm();
  initUserForm();
  initConfirmDelete();

  renderAll();
});

/* ---------- Top bar / user chip ---------- */
export function initUserChip(){
  document.getElementById('userName').textContent = CURRENT_USER.name;
  document.getElementById('userRole').textContent = CURRENT_USER.role;
  document.getElementById('userAvatar').textContent = CURRENT_USER.name.charAt(0).toUpperCase();

  const chip = document.getElementById('userChip');
  const menu = document.getElementById('userMenu');
  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('show');
  });
  document.addEventListener('click', () => menu.classList.remove('show'));
}


function initLogout(){
  function doLogout(e){
    e.preventDefault();
    localStorage.removeItem(DB_KEYS.session);
    window.location.href = 'index.html';
  }
  document.getElementById('logoutLink').addEventListener('click', doLogout);
  document.getElementById('logoutLink2').addEventListener('click', doLogout);
}

/* ---------- Sidebar navigation ---------- */
export function initNavigation(){
  const links = document.querySelectorAll('.sidebar-nav .nav-link[data-view]');
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
      const view = link.dataset.view;
      document.getElementById('view-' + view).classList.add('active');

      document.getElementById('pageTitle').textContent = VIEW_META[view].title;
      // document.getElementById('pageSubtitle').textContent = VIEW_META[view].sub;

      closeSidebarMobile();
    });
  });
}

function initHamburger(){
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    sidebar.classList.add('show');
    overlay.classList.add('show');
  });
  overlay.addEventListener('click', closeSidebarMobile);
}
function closeSidebarMobile(){
  document.getElementById('sidebar').classList.remove('show');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

/* ---------- Generic modal helpers ---------- */
export function openModal(id){ document.getElementById(id).classList.add('show'); }
export function closeModal(id){ document.getElementById(id).classList.remove('show'); }

function initModalClosers(){
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.lib-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if(e.target === backdrop) backdrop.classList.remove('show');
    });
  });
}

/* ---------- Search boxes (per-section only) ---------- */
function initSearchBoxes(){
  document.getElementById('searchBooks').addEventListener('input', (e) => renderBooks(e.target.value));
  document.getElementById('searchCategories').addEventListener('input', (e) => renderCategories(e.target.value));
  document.getElementById('searchOrders').addEventListener('input', (e) => renderOrders(e.target.value));
  document.getElementById('searchUsers').addEventListener('input', (e) => renderUsers(e.target.value));
}

/* ---------- Render everything (called once on load) ---------- */
function renderAll(){
  renderDashboardStats();
  renderBooks();
  renderCategories();
  renderOrders();
  renderUsers();
}


const DELETE_LABELS = {
  book: (item) => item.title,
  category: (item) => item.name,
  order: (item) => `order #${item.id}`,
  user: (item) => item.name
};
const DELETE_KEYS = {
  book: DB_KEYS.books,
  category: DB_KEYS.categories,
  order: DB_KEYS.orders,
  user: DB_KEYS.users
};

export function requestDelete(type, id){
  const list = dbGet(DELETE_KEYS[type]);
  const item = list.find(i => i.id === id);
  if(!item) return;

  if(type === 'user' && CURRENT_USER.id === id){
    showToast('You cannot delete the account you are logged in with.', 'danger');
    return;
  }

  DELETE_CONTEXT = { type, id };
  document.getElementById('confirmTarget').textContent = DELETE_LABELS[type](item);
  openModal('confirmModal');
}

function initConfirmDelete(){
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if(!DELETE_CONTEXT) return;
    const { type, id } = DELETE_CONTEXT;

    const key = DELETE_KEYS[type];
    const list = dbGet(key).filter(i => i.id !== id);
    dbSet(key, list);

    closeModal('confirmModal');
    DELETE_CONTEXT = null;

    const labels = { book: 'Book', category: 'Category', order: 'Order', user: 'User' };
    showToast(`${labels[type]} deleted successfully.`, 'success');

    if(type === 'book'){ renderBooks(document.getElementById('searchBooks').value); renderCategories(document.getElementById('searchCategories').value); }
    if(type === 'category') renderCategories(document.getElementById('searchCategories').value);
    if(type === 'order') renderOrders(document.getElementById('searchOrders').value);
    if(type === 'user') renderUsers(document.getElementById('searchUsers').value);

    renderDashboardStats();
  });
}