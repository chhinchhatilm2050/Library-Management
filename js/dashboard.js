
import { dbGet, DB_KEYS, escapeHtml, statusBadge } from "./utils.js";
export function renderDashboardStats(){
  const books = dbGet(DB_KEYS.books);
  const categories = dbGet(DB_KEYS.categories);
  const orders = dbGet(DB_KEYS.orders);
  const users = dbGet(DB_KEYS.users);

  document.getElementById('statBooks').textContent = books.length;
  document.getElementById('statCategories').textContent = categories.length;
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statUsers').textContent = users.length;

  const recent = [...orders].slice(-5).reverse();
  document.getElementById('recentCountPill').textContent = `${orders.length} record${orders.length !== 1 ? 's' : ''}`;
  const body = document.getElementById('recentOrdersBody');

  if(recent.length === 0){
    body.innerHTML = `<tr class="empty-row"><td colspan="6">No orders yet.</td></tr>`;
    return;
  }

  body.innerHTML = recent.map(o => `
    <tr>
      <td class="id-cell">#${o.id}</td>
      <td class="cell-strong">${escapeHtml(o.borrower)}</td>
      <td>${escapeHtml(o.book)}</td>
      <td>${escapeHtml(o.quantity)}</td>
      <td>${escapeHtml(o.date)}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>
  `).join('');
}
