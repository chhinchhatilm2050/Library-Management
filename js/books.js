
import { dbGet, dbSet, escapeHtml, showToast, nextId, DB_KEYS} from "./utils.js";
import { openModal, closeModal, requestDelete } from "./core.js";
function getBookCategoryOptionsHtml(selected){
  const categories = dbGet(DB_KEYS.categories);
  if(categories.length === 0) return `<option value="">No categories yet</option>`;
  return categories.map(c =>
    `<option value="${escapeHtml(c.name)}" ${c.name === selected ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
  ).join('');
}

export function renderBooks(filter = ''){
  const books = dbGet(DB_KEYS.books);
  const term = filter.trim().toLowerCase();

  const filtered = books.filter(b =>
    !term ||
    b.title.toLowerCase().includes(term) ||
    b.author.toLowerCase().includes(term) ||
    b.category.toLowerCase().includes(term)
  );

  document.getElementById('booksCountPill').textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;
  const body = document.getElementById('booksBody');

  if(filtered.length === 0){
    body.innerHTML = `<tr class="empty-row"><td colspan="7">No books found.</td></tr>`;
    return;
  }

  body.innerHTML = filtered.map(b => `
    <tr>
      <td class="id-cell">#${b.id}</td>
      <td class="cell-strong">${escapeHtml(b.title)}</td>
      <td>${escapeHtml(b.author)}</td>
      <td>${escapeHtml(b.category)}</td>
      <td>${escapeHtml(b.quantity)}</td>
      <td>${b.quantity > 0 ? `<span class="badge-status available">Available</span>` : `<span class="badge-status out">Out of Stock</span>`}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn edit" data-edit-book="${b.id}" title="Edit"><i class="bi bi-pencil-square"></i></button>
          <button class="icon-btn delete" data-delete-book="${b.id}" title="Delete"><i class="bi bi-trash3"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-edit-book]').forEach(btn =>
    btn.addEventListener('click', () => openEditBook(Number(btn.dataset.editBook)))
  );
  body.querySelectorAll('[data-delete-book]').forEach(btn =>
    btn.addEventListener('click', () => requestDelete('book', Number(btn.dataset.deleteBook)))
  );
}

function openAddBook(){
  document.getElementById('bookModalTitle').textContent = 'Add Book';
  document.getElementById('bookForm').reset();
  document.getElementById('bookId').value = '';
  document.getElementById('bookCategory').innerHTML = getBookCategoryOptionsHtml();
  document.getElementById('bookQuantity').value = 1;
  openModal('bookModal');
}

function openEditBook(id){
  const books = dbGet(DB_KEYS.books);
  const book = books.find(b => b.id === id);
  if(!book) return;

  document.getElementById('bookModalTitle').textContent = 'Edit Book';
  document.getElementById('bookId').value = book.id;
  document.getElementById('bookTitle').value = book.title;
  document.getElementById('bookAuthor').value = book.author;
  document.getElementById('bookCategory').innerHTML = getBookCategoryOptionsHtml(book.category);
  document.getElementById('bookQuantity').value = book.quantity;
  openModal('bookModal');
}

export function initBookForm(){
  document.getElementById('addBookBtn').addEventListener('click', openAddBook);

  document.getElementById('bookSaveBtn').addEventListener('click', () => {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const category = document.getElementById('bookCategory').value;
    const quantity = Number(document.getElementById('bookQuantity').value);
    const id = document.getElementById('bookId').value;

    if(!title || !author || !category || quantity === '' || quantity < 0 || isNaN(quantity)){
      showToast('Please fill in all book fields correctly.', 'danger');
      return;
    }

    const books = dbGet(DB_KEYS.books);

    if(id){
      const book = books.find(b => b.id === Number(id));
      book.title = title; book.author = author; book.category = category; book.quantity = quantity;
      dbSet(DB_KEYS.books, books);
      showToast('Book updated successfully.', 'success');
    }else{
      books.push({ id: nextId(books), title, author, category, quantity });
      dbSet(DB_KEYS.books, books);
      showToast('Book added successfully.', 'success');
    }

    closeModal('bookModal');
    renderBooks(document.getElementById('searchBooks').value);
    renderCategories(document.getElementById('searchCategories').value);
    renderDashboardStats();
  });
}
