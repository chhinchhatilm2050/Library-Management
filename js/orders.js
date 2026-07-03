
import { dbGet, dbSet, DB_KEYS, escapeHtml, showToast, nextId, statusBadge, todayStr } from "./utils.js";
import { openModal, closeModal, requestDelete } from "./core.js";


function getOrderBookOptionsHtml(selected){
  const books = dbGet(DB_KEYS.books);
  if(books.length === 0) return `<option value="">No books yet</option>`;
  return books.map(b =>
    `<option value="${escapeHtml(b.title)}" ${b.title === selected ? 'selected' : ''}>${escapeHtml(b.title)}</option>`
  ).join('');
}

export function renderOrders(filter = ''){
  const orders = dbGet(DB_KEYS.orders);
  const term = filter.trim().toLowerCase();

  const filtered = orders.filter(o =>
    !term ||
    o.borrower.toLowerCase().includes(term) ||
    o.book.toLowerCase().includes(term) ||
    o.status.toLowerCase().includes(term)
  );

  document.getElementById('ordersCountPill').textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;
  const body = document.getElementById('ordersBody');

  if(filtered.length === 0){
    body.innerHTML = `<tr class="empty-row"><td colspan="7">No orders found.</td></tr>`;
    return;
  }

  body.innerHTML = filtered.map(o => `
    <tr>
      <td class="id-cell">#${o.id}</td>
      <td class="cell-strong">${escapeHtml(o.borrower)}</td>
      <td>${escapeHtml(o.book)}</td>
      <td>${escapeHtml(o.quantity)}</td>
      <td>${escapeHtml(o.date)}</td>
      <td>${statusBadge(o.status)}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn edit" data-edit-order="${o.id}" title="Edit"><i class="bi bi-pencil-square"></i></button>
          <button class="icon-btn delete" data-delete-order="${o.id}" title="Delete"><i class="bi bi-trash3"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-edit-order]').forEach(btn =>
    btn.addEventListener('click', () => openEditOrder(Number(btn.dataset.editOrder)))
  );
  body.querySelectorAll('[data-delete-order]').forEach(btn =>
    btn.addEventListener('click', () => requestDelete('order', Number(btn.dataset.deleteOrder)))
  );
}

function openAddOrder(){
  document.getElementById('orderModalTitle').textContent = 'Add Order';
  document.getElementById('orderForm').reset();
  document.getElementById('orderId').value = '';
  document.getElementById('orderBook').innerHTML = getOrderBookOptionsHtml();
  document.getElementById('orderQuantity').value = 1;
  document.getElementById('orderDate').value = todayStr();
  document.getElementById('orderStatus').value = 'Pending';
  openModal('orderModal');
}

function openEditOrder(id){
  const orders = dbGet(DB_KEYS.orders);
  const order = orders.find(o => o.id === id);
  if(!order) return;

  document.getElementById('orderModalTitle').textContent = 'Edit Order';
  document.getElementById('orderId').value = order.id;
  document.getElementById('orderBorrower').value = order.borrower;
  document.getElementById('orderBook').innerHTML = getOrderBookOptionsHtml(order.book);
  document.getElementById('orderQuantity').value = order.quantity;
  document.getElementById('orderDate').value = order.date;
  document.getElementById('orderStatus').value = order.status;
  openModal('orderModal');
}

export function initOrderForm(){
  document.getElementById('addOrderBtn').addEventListener('click', openAddOrder);

  document.getElementById('orderSaveBtn').addEventListener('click', () => {
    const borrower = document.getElementById('orderBorrower').value.trim();
    const book = document.getElementById('orderBook').value;
    const quantity = Number(document.getElementById('orderQuantity').value);
    const date = document.getElementById('orderDate').value;
    const status = document.getElementById('orderStatus').value;
    const id = document.getElementById('orderId').value;

    if(!borrower || !book || !date || !quantity || quantity < 1){
      showToast('Please fill in all order fields correctly.', 'danger');
      return;
    }

    const orders = dbGet(DB_KEYS.orders);

    if(id){
      const order = orders.find(o => o.id === Number(id));
      order.borrower = borrower; order.book = book; order.quantity = quantity; order.date = date; order.status = status;
      dbSet(DB_KEYS.orders, orders);
      showToast('Order updated successfully.', 'success');
    }else{
      orders.push({ id: nextId(orders), borrower, book, quantity, date, status });
      dbSet(DB_KEYS.orders, orders);
      showToast('Order added successfully.', 'success');
    }

    closeModal('orderModal');
    renderOrders(document.getElementById('searchOrders').value);
    renderDashboardStats();
  });
}
