// Utilitário de debug para identificar e resolver problemas

export const clearAllData = () => {
  // console.log('🧹 Limpando todos os dados da aplicação...');
  
  // Limpar localStorage
  const localStorageKeys = Object.keys(localStorage);
  localStorageKeys.forEach(key => {
    localStorage.removeItem(key);
    // console.log(`✅ Removido localStorage: ${key}`);
  });
  
  // Limpar sessionStorage
  const sessionStorageKeys = Object.keys(sessionStorage);
  sessionStorageKeys.forEach(key => {
    sessionStorage.removeItem(key);
    // console.log(`✅ Removido sessionStorage: ${key}`);
  });
  
  // console.log('✨ Limpeza concluída!');
};

export const logUserData = () => {
  // console.log('🔍 Estado atual dos dados do usuário:');
  // console.log('localStorage authToken:', localStorage.getItem('authToken'));
  // console.log('localStorage userData:', localStorage.getItem('userData'));
  // console.log('sessionStorage keys:', Object.keys(sessionStorage));
  // console.log('localStorage keys:', Object.keys(localStorage));
};

export const forceReloadWithCleanState = () => {
  clearAllData();
  setTimeout(() => {
    window.location.href = '/login?logout=true';
  }, 100);
};

// Disponibilizar no console para debug
if (typeof window !== 'undefined') {
  window.clearAllData = clearAllData;
  window.logUserData = logUserData;
  window.forceReloadWithCleanState = forceReloadWithCleanState;
}
