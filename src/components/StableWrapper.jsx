import { useState, useEffect } from "react";

// Wrapper simples para garantir renderização estável
const StableWrapper = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Carregando...</div>;
  }

  return children;
};

export default StableWrapper;
