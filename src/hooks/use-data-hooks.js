import { useOptimizedData } from './use-optimized-data'
import { useCallback } from 'react'
import { 
  listFreights, 
  getCompanyFreights,
  getUserVehicles, 
  getMyInterests,
  getCompanyStats,
  getAdminStats,
  getAdminUsers
} from '../config/api'

/**
 * Hooks específicos para cada tipo de dados com configurações otimizadas
 */

// Hook para fretes (listagem geral)
export const useFreights = (options = {}) => {
  return useOptimizedData(
    () => listFreights(1, 50),
    { 
      cacheDuration: 20000, // 20 segundos
      ...options 
    }
  )
}

// Hook para fretes da empresa
export const useCompanyFreights = (options = {}) => {
  return useOptimizedData(
    getCompanyFreights,
    { 
      cacheDuration: 15000, // 15 segundos (dados mais críticos)
      ...options 
    }
  )
}

// Hook para veículos do usuário
export const useUserVehicles = (options = {}) => {
  return useOptimizedData(
    getUserVehicles,
    { 
      cacheDuration: 60000, // 60 segundos (mudam pouco)
      ...options 
    }
  )
}

// Hook para interesses do motorista
export const useMyInterests = (options = {}) => {
  return useOptimizedData(
    getMyInterests,
    { 
      cacheDuration: 30000, // 30 segundos
      ...options 
    }
  )
}

// Hook para estatísticas da empresa
export const useCompanyStats = (options = {}) => {
  return useOptimizedData(
    () => getCompanyStats().catch(() => ({ data: { success: false, data: {} } })),
    { 
      cacheDuration: 120000, // 2 minutos (dados estatísticos)
      ...options 
    }
  )
}

/**
 * Hook combinado para dashboard do motorista
 */
export const useDriverDashboard = () => {
  const freightsResult = useFreights()
  const vehiclesResult = useUserVehicles()
  const interestsResult = useMyInterests()

  // Usar useCallback para evitar recriação da função refresh
  const refresh = useCallback(() => {
    freightsResult.refresh()
    vehiclesResult.refresh()
    interestsResult.refresh()
  }, [freightsResult.refresh, vehiclesResult.refresh, interestsResult.refresh])

  return {
    freights: freightsResult.data || [],
    vehicles: vehiclesResult.data || [],
    interests: interestsResult.data || [],
    loading: freightsResult.loading || vehiclesResult.loading || interestsResult.loading,
    error: freightsResult.error || vehiclesResult.error || interestsResult.error,
    refresh
  }
}

/**
 * Hook combinado para dashboard da empresa
 */
export const useCompanyDashboard = () => {
  const freightsResult = useCompanyFreights()
  const statsResult = useCompanyStats()

  // Derivar estatísticas dos dados
  const freights = freightsResult.data || []
  const rawStats = statsResult.data || {}
  
  const stats = {
    total_freights: freights.length,
    active_freights: freights.filter(f => f.status === 'active').length,
    inactive_freights: freights.filter(f => f.status === 'inactive').length,
    completed_freights: freights.filter(f => f.status === 'completed').length,
    ...rawStats
  }

  // Usar useCallback para evitar recriação da função refresh
  const refresh = useCallback(() => {
    freightsResult.refresh()
    statsResult.refresh()
  }, [freightsResult.refresh, statsResult.refresh])

  return {
    freights,
    stats,
    loading: freightsResult.loading || statsResult.loading,
    error: freightsResult.error || statsResult.error,
    refresh
  }
}

/**
 * Hook combinado para dashboard do admin
 */
export const useAdminDashboard = () => {
  const statsResult = useOptimizedData({
    key: 'admin-stats',
    fetchFunction: getAdminStats,
    options: { cacheDuration: 60000 } // Cache por 60 segundos
  })

  const usersResult = useOptimizedData({
    key: 'admin-users', 
    fetchFunction: getAdminUsers,
    options: { cacheDuration: 30000 } // Cache por 30 segundos
  })

  // Usar useCallback para evitar recriação da função refresh
  const refresh = useCallback(() => {
    statsResult.refresh()
    usersResult.refresh()
  }, [statsResult.refresh, usersResult.refresh])

  return {
    stats: statsResult.data || {},
    users: usersResult.data || [],
    loading: statsResult.loading || usersResult.loading,
    error: statsResult.error || usersResult.error,
    refresh
  }
}
