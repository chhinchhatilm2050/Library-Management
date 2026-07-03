
import { showToast, dbSet, dbGet, escapeHtml, DB_KEYS, nextId, todayStr } from "./utils.js";
import { openModal, closeModal, requestDelete, CURRENT_USER, initUserChip } from "./core.js";
export function renderUsers(filter = ''){
  const users = dbGet(DB_KEYS.users);
  const term = filter.trim().toLowerCase();

  const filtered = users.filter(u =>
    !term ||
    u.name.toLowerCase().includes(term) ||
    u.email.toLowerCase().includes(term) ||
    u.role.toLowerCase().includes(term)
  );

  document.getElementById('usersCountPill').textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;
  const body = document.getElementById('usersBody');

  if(filtered.length === 0){
    body.innerHTML = `<tr class="empty-row"><td colspan="6">No users found.</td></tr>`;
    return;
  }

  body.innerHTML = filtered.map(u => `
    <tr>
      <td class="id-cell">#${u.id}</td>
      <td class="cell-strong">${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="role-pill">${escapeHtml(u.role)}</span></td>
      <td>${escapeHtml(u.joined || '—')}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn edit" data-edit-user="${u.id}" title="Edit"><i class="bi bi-pencil-square"></i></button>
          <button class="icon-btn delete" data-delete-user="${u.id}" title="Delete"><i class="bi bi-trash3"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-edit-user]').forEach(btn =>
    btn.addEventListener('click', () => openEditUser(Number(btn.dataset.editUser)))
  );
  body.querySelectorAll('[data-delete-user]').forEach(btn =>
    btn.addEventListener('click', () => requestDelete('user', Number(btn.dataset.deleteUser)))
  );
}

function openAddUser(){
  document.getElementById('userModalTitle').textContent = 'Add User';
  document.getElementById('userForm').reset();
  document.getElementById('userId').value = '';
  document.getElementById('userRoleSelect').value = 'Member';
  openModal('userModal');
}

function openEditUser(id){
  const users = dbGet(DB_KEYS.users);
  const user = users.find(u => u.id === id);
  if(!user) return;

  document.getElementById('userModalTitle').textContent = 'Edit User';
  document.getElementById('userId').value = user.id;
  document.getElementById('userFullName').value = user.name;
  document.getElementById('userEmail').value = user.email;
  document.getElementById('userRoleSelect').value = user.role;
  document.getElementById('userPassword').value = user.password;
  openModal('userModal');
}

export function initUserForm(){
  document.getElementById('addUserBtn').addEventListener('click', openAddUser);

  document.getElementById('userSaveBtn').addEventListener('click', () => {
    const name = document.getElementById('userFullName').value.trim();
    const email = document.getElementById('userEmail').value.trim().toLowerCase();
    const role = document.getElementById('userRoleSelect').value;
    const password = document.getElementById('userPassword').value;
    const id = document.getElementById('userId').value;

    if(!name || !email || !password){
      showToast('Please fill in all user fields.', 'danger');
      return;
    }

    const users = dbGet(DB_KEYS.users);
    const duplicate = users.find(u => u.email.toLowerCase() === email && String(u.id) !== String(id));
    if(duplicate){
      showToast('Another user already uses this email.', 'danger');
      return;
    }

    if(id){
      const user = users.find(u => u.id === Number(id));
      user.name = name; user.email = email; user.role = role; user.password = password;
      dbSet(DB_KEYS.users, users);
      showToast('User updated successfully.', 'success');

      if(CURRENT_USER.id === user.id){
        CURRENT_USER = { id: user.id, name: user.name, email: user.email, role: user.role };
        localStorage.setItem(DB_KEYS.session, JSON.stringify(CURRENT_USER));
        initUserChip();
      }
    }else{
      users.push({ id: nextId(users), name, email, password, role, joined: todayStr() });
      dbSet(DB_KEYS.users, users);
      showToast('User added successfully.', 'success');
    }

    closeModal('userModal');
    renderUsers(document.getElementById('searchUsers').value);
    renderDashboardStats();
  });
}
