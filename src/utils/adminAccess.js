// Comando especial para acesso administrativo
// Execute no console do navegador: adminAccess()

window.adminAccess = function() {
  const adminCredentials = prompt('Digite o email do administrador:');
  if (!adminCredentials) return;
  
  const adminPassword = prompt('Digite a senha do administrador:');
  if (!adminPassword) return;
  
  // Fazer login como admin
  fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: adminCredentials,
      password: adminPassword
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success && data.data.user.user_type === 'admin') {
      localStorage.setItem('authToken', data.data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.data.user));
      alert('Login admin realizado com sucesso!');
      window.location.href = '/admin/dashboard';
    } else {
      alert('Credenciais inválidas ou usuário não é administrador');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro ao fazer login');
  });
};

// Admin access loading complete

export default window.adminAccess;
