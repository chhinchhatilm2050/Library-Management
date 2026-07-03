import { seedDatabase, dbGet, dbSet, nextId, DB_KEYS, todayStr  } from "./utils.js";
document.addEventListener('DOMContentLoaded', () => {
  seedDatabase();
  if(localStorage.getItem(DB_KEYS.session)){
    window.location.href = 'dashboard.html';
    return;
  }

  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginPane = document.getElementById('loginPane');
  const registerPane = document.getElementById('registerPane');
  const goRegister = document.getElementById('goRegister');
  const goLogin = document.getElementById('goLogin');

  const borderEmail = document.getElementById('loginEmail');
  const borderPass = document.getElementById('loginPassword');
  const name = document.getElementById('regName');
  const email = document.getElementById('regEmail');
  const password = document.getElementById('regPassword');
  const confirm = document.getElementById('regConfirm');

  function showBoder() {
    borderEmail.style.border = '1px solid red';
    borderPass.style.border = '1px solid red';
    name.style.border = '1px solid red';
    email.style.border = '1px solid red';
    password.style.border = '1px solid red';
    confirm.style.border = '1px solid red';
  }
  function hideBorder() {
    borderEmail.style.border = 'none';
    borderPass.style.border = 'none';
    name.style.border = 'none';
    email.style.border = 'none';
    password.style.border = 'none';
    confirm.style.border = 'none';
  }

  function showLogin(){
    loginPane.style.display = '';
    registerPane.style.display = 'none';
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    hideError(document.getElementById('loginError'));
    document.getElementById('loginForm').reset();
    hideBorder()
  }

  function showRegister(){
    loginPane.style.display = 'none';
    registerPane.style.display = '';
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    hideError(document.getElementById('registerSuccess'));
    hideError(document.getElementById('fullNameErr'));
    hideError(document.getElementById('emailErr'));
    hideError(document.getElementById('passwordErr'));
    hideError(document.getElementById('confirmPassErr'));
    hideError(document.getElementById('registerError'));
    document.getElementById('registerForm').reset();
    hideBorder();
  }

  
  function hideError(el){ el.style.display = 'none'; el.textContent = ''; }
  function showError(el, msg){ el.textContent = msg; el.style.display = 'block'; }
  function showSuccess(el, msg){ el.textContent = msg; el.style.display = 'block'; }

  tabLoginBtn.addEventListener('click', showLogin);
  tabRegisterBtn.addEventListener('click', showRegister);
  goRegister.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
  goLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

  const eyepass = document.getElementById('eyePass');
  const loginPasswordInput = document.getElementById('loginPassword');

  eyepass.addEventListener('click', () => {
    const isPassword = loginPasswordInput.type === 'password';
    loginPasswordInput.type = isPassword ? 'text' : 'password';
    eyepass.classList.toggle('bi-eye', !isPassword);
    eyepass.classList.toggle('bi-eye-slash', isPassword);
  });



  document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();
    const errorEl = document.getElementById('loginError');
    hideError(errorEl);
    
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    

    
    const users = dbGet(DB_KEYS.users);
    const match = users.find(u => u.email.toLowerCase() === email && u.password === password);

    if(!match){
      showError(errorEl, 'Incorrect email or password. Please try again.');
      showBoder();
      return;
    }

    localStorage.setItem(DB_KEYS.session, JSON.stringify({
      id: match.id, name: match.name, email: match.email, role: match.role
    }));

    window.location.href = 'dashboard.html';
  });

 
  const eyepassRe = document.getElementById('eyePassRe');
  const registerPasswordInput = document.getElementById('regPassword');
  eyepassRe.addEventListener('click', () => {
    const isPassword = registerPasswordInput.type === 'password';
    registerPasswordInput.type = isPassword ? 'text' : 'password';
    eyepassRe.classList.toggle('bi-eye', !isPassword);
    eyepassRe.classList.toggle('bi-eye-slash', isPassword);
  });

  document.getElementById('registerForm').addEventListener('submit', function(e){
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    
    const fullNameErr = document.getElementById('fullNameErr');
    const emailErr = document.getElementById('emailErr');
    const passwodErr = document.getElementById('passwordErr');
    const confirmPassErr = document.getElementById('confirmPassErr');
    const successEl = document.getElementById('registerSuccess');
    const errorEl = document.getElementById('registerError');
    hideError(successEl);
    hideError(fullNameErr);
    hideError(emailErr);
    hideError(passwodErr);
    hideError(confirmPassErr);
    let isValid = true;

    if(!name) {
      showError(fullNameErr, 'Full name is required.');
      isValid = false;
    }
    if(!email) {
      showError(emailErr, 'Email is required.');
      isValid = false;
    }
    if(!password) {
      showError(passwodErr, 'Paword is required');
      isValid = false;
    } else if(password.length < 6) {
      showError(passwodErr, 'Password must be at least 6 characters.');
      isValid = false;
    }

    if(!confirm) {
      showError(confirmPassErr, 'Confirm is required');
      isValid = false;
    }
    
    if(password !== confirm){
      showError(confirmPassErr, 'Passwords do not match.');
      isValid = false;
    }

    

    const users = dbGet(DB_KEYS.users);
    if(users.some(u => u.email.toLowerCase() === email)){
      showError(errorEl, 'An account with this email already exists.');
      isValid = false;
    }

    if(!isValid) {
      showBoder();
      return;
    }

    const newUser = {
      id: nextId(users),
      name, email, password,
      role: 'Member',
      joined: todayStr()
    };
    users.push(newUser);
    dbSet(DB_KEYS.users, users);

    document.getElementById('registerForm').reset();
    showSuccess(successEl, 'Account created! You can log in now.');

    setTimeout(() => {
      showLogin();
      document.getElementById('loginEmail').value = email;
    }, 900);
  });
});
