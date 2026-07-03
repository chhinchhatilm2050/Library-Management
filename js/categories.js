
import { dbGet, dbSet, escapeHtml, showToast, nextId , DB_KEYS } from "./utils.js";
import { openModal, closeModal, requestDelete } from "./core.js";

export function renderCategories(filter = ''){
  const categories = dbGet(DB_KEYS.categories);
  const books = dbGet(DB_KEYS.books);
  const term = filter.trim().toLowerCase();

  const filtered = categories.filter(c =>
    !term ||
    c.name.toLowerCase().includes(term) ||
    (c.description || '').toLowerCase().includes(term)
  );

  document.getElementById('categoriesCountPill').textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;
  const body = document.getElementById('categoriesBody');

  if(filtered.length === 0){
    body.innerHTML = `<tr class="empty-row"><td colspan="5">No categories found.</td></tr>`;
    return;
  }

  body.innerHTML = filtered.map(c => {
    const bookCount = books.filter(b => b.category === c.name).length;
    return `
    <tr>
      <td class="id-cell">#${c.id}</td>
      <td class="cell-strong">${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.description || '—')}</td>
      <td>${bookCount}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn edit" data-edit-category="${c.id}" title="Edit"><i class="bi bi-pencil-square"></i></button>
          <button class="icon-btn delete" data-delete-category="${c.id}" title="Delete"><i class="bi bi-trash3"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

  body.querySelectorAll('[data-edit-category]').forEach(btn =>
    btn.addEventListener('click', () => openEditCategory(Number(btn.dataset.editCategory)))
  );
  body.querySelectorAll('[data-delete-category]').forEach(btn =>
    btn.addEventListener('click', () => requestDelete('category', Number(btn.dataset.deleteCategory)))
  );
}

function openAddCategory(){
  document.getElementById('categoryModalTitle').textContent = 'Add Category';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryId').value = '';
  openModal('categoryModal');
}

function openEditCategory(id){
  const categories = dbGet(DB_KEYS.categories);
  const category = categories.find(c => c.id === id);
  if(!category) return;

  document.getElementById('categoryModalTitle').textContent = 'Edit Category';
  document.getElementById('categoryId').value = category.id;
  document.getElementById('categoryName').value = category.name;
  document.getElementById('categoryDescription').value = category.description || '';
  openModal('categoryModal');
}

export function initCategoryForm(){
  document.getElementById('addCategoryBtn').addEventListener('click', openAddCategory);

  document.getElementById('categorySaveBtn').addEventListener('click', () => {
    const name = document.getElementById('categoryName').value.trim();
    const description = document.getElementById('categoryDescription').value.trim();
    const id = document.getElementById('categoryId').value;

    if(!name){
      showToast('Category name is required.', 'danger');
      return;
    }

    const categories = dbGet(DB_KEYS.categories);

    if(id){
      const category = categories.find(c => c.id === Number(id));
      const oldName = category.name;
      category.name = name; category.description = description;
      dbSet(DB_KEYS.categories, categories);

      // Keep books referencing this category in sync
      if(oldName !== name){
        const books = dbGet(DB_KEYS.books);
        books.forEach(b => { if(b.category === oldName) b.category = name; });
        dbSet(DB_KEYS.books, books);
      }
      showToast('Category updated successfully.', 'success');
    }else{
      categories.push({ id: nextId(categories), name, description });
      dbSet(DB_KEYS.categories, categories);
      showToast('Category added successfully.', 'success');
    }

    closeModal('categoryModal');
    renderCategories(document.getElementById('searchCategories').value);
    renderBooks(document.getElementById('searchBooks').value);
    renderDashboardStats();
  });
}
