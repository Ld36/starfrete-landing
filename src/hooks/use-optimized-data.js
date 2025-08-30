import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook customizado para gerenciar requisições otimizadas com cache, debounce e controle de duplicatas
 * @param {Function|Object} fetchFunctionOrConfig - Função que faz a requisição à API OU objeto de configuração {key, fetchFunction, options}
 * @param {Object} options - Configurações do hook (usado apenas quando primeiro parâmetro é função)
 * @returns {Object} - Estado e funções de controle
 */
export const useOptimizedData = (fetchFunctionOrConfig, options = {}) => {
  let fetchFunction, finalOptions
  
  // Suporte para ambos os formatos: função + options OU config object
  if (typeof fetchFunctionOrConfig === 'function') {
    fetchFunction = fetchFunctionOrConfig
    finalOptions = options
  } else {
    const { fetchFunction: configFetchFunction, options: configOptions = {} } = fetchFunctionOrConfig
    fetchFunction = configFetchFunction
    finalOptions = configOptions
  }

  const {
    cacheDuration = 30000, // 30 segundos por padrão
    debounceTime = 300,     // 300ms por padrão
    initialData = null,
    dependencies = [],
    autoFetch = true
  } = finalOptions

  // Estados
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Refs para controle
  const abortControllerRef = useRef(null)
  const isLoadingRef = useRef(false)
  const cacheRef = useRef({
    data: null,
    lastFetch: null,
    error: null
  })
  const debounceTimeoutRef = useRef(null)

  // Função para limpar timeouts e requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
  }, [])

  // Função principal de fetch com otimizações
  const fetchData = useCallback(async (...args) => {
    try {
      const now = Date.now()
      
      // Verificar se já estamos carregando
      if (isLoadingRef.current) {
        return cacheRef.current.data
      }

      // Verificar cache válido
      if (cacheRef.current.data && 
          cacheRef.current.lastFetch && 
          now - cacheRef.current.lastFetch < cacheDuration && 
          !cacheRef.current.error) {
        return cacheRef.current.data
      }

      // Marcar como carregando
      isLoadingRef.current = true
      setLoading(true)
      setError(null)

      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Criar novo AbortController
      abortControllerRef.current = new AbortController()

      // Implementar retry para timeouts
      let lastError = null
      const maxRetries = 2
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // Fazer a requisição
          const result = await fetchFunction(...args)
          
          // Atualizar cache e estado
          const responseData = result?.data?.data || result?.data || result
          cacheRef.current = {
            data: responseData,
            lastFetch: now,
            error: null
          }
          
          setData(responseData)
          return responseData
          
        } catch (err) {
          lastError = err
          
          // Se foi cancelado, não tentar novamente
          if (err.name === 'AbortError') {
            return null
          }
          
          // Para timeouts, tentar novamente (exceto na última tentativa)
          if ((err.code === 'ECONNABORTED' || err.message.includes('timeout')) && attempt < maxRetries) {
            console.log(`Tentativa ${attempt + 1} falhou por timeout, tentando novamente...`)
            // Aguardar um pouco antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          }
          
          // Para outros erros, parar imediatamente
          break
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      throw lastError

    } catch (err) {
      if (err.name !== 'AbortError') {
        let errorMessage = 'Erro ao carregar dados'
        
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          errorMessage = 'A conexão demorou muito para responder. Verifique sua internet e tente novamente.'
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.message) {
          errorMessage = err.message
        }
        
        cacheRef.current.error = errorMessage
        setError(errorMessage)
        console.error('Erro na requisição:', err)
      }
      return null
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [fetchFunction, cacheDuration])

  // Função com debounce
  const fetchDataDebounced = useCallback((...args) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchData(false, ...args)
    }, debounceTime)
  }, [fetchData, debounceTime])

  // Função para forçar refresh
  const refresh = useCallback((...args) => {
    return fetchData(true, ...args)
  }, [fetchData])

  // Função para limpar cache
  const clearCache = useCallback(() => {
    cacheRef.current = {
      data: null,
      lastFetch: null,
      error: null
    }
    setData(initialData)
    setError(null)
  }, [initialData])

  // Auto-fetch na montagem do componente
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }

    // Cleanup na desmontagem
    return cleanup
  }, dependencies)

  // Cleanup no desmonte
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    data,
    loading,
    error,
    fetchData,
    fetchDataDebounced,
    refresh,
    clearCache,
    isStale: () => {
      const now = Date.now()
      return !cacheRef.current.lastFetch || 
             (now - cacheRef.current.lastFetch >= cacheDuration)
    }
  }
}

/**
 * Hook para múltiplas requisições paralelas otimizadas
 * @param {Array} fetchConfigs - Array de configurações {key, fetchFunction, options}
 * @returns {Object} - Estados e funções organizados por chave
 */
export const useOptimizedMultipleData = (fetchConfigs) => {
  const [states, setStates] = useState({})
  const [globalLoading, setGlobalLoading] = useState(false)
  const controllersRef = useRef({})

  const fetchAll = useCallback(async (forceRefresh = false) => {
    setGlobalLoading(true)
    
    try {
      const promises = fetchConfigs.map(async (config) => {
        const { key, fetchFunction, options = {} } = config
        
        try {
          // Cancelar requisição anterior específica
          if (controllersRef.current[key]) {
            controllersRef.current[key].abort()
          }
          
          controllersRef.current[key] = new AbortController()
          
          const result = await fetchFunction()
          return { key, data: result?.data?.data || result?.data || result, error: null }
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error(`Erro ao carregar ${key}:`, err)
            return { key, data: null, error: err.message }
          }
          return { key, data: null, error: null }
        }
      })

      const results = await Promise.allSettled(promises)
      
      const newStates = {}
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { key, data, error } = result.value
          newStates[key] = { data, error, loading: false }
        }
      })
      
      setStates(prev => ({ ...prev, ...newStates }))
      
    } catch (error) {
      console.error('Erro no fetchAll:', error)
    } finally {
      setGlobalLoading(false)
    }
  }, [fetchConfigs])

  // Auto-fetch na montagem
  useEffect(() => {
    fetchAll()
    
    // Cleanup
    return () => {
      Object.values(controllersRef.current).forEach(controller => {
        if (controller) controller.abort()
      })
    }
  }, [])

  return {
    states,
    globalLoading,
    fetchAll,
    refresh: () => fetchAll(true)
  }
}

export default useOptimizedData
