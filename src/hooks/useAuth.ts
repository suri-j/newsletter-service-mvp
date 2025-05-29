'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // 타임아웃 설정 (10초 후 강제로 로딩 완료)
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth timeout reached, setting loading to false')
        setLoading(false)
      }
    }, 10000)

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const supabase = getSupabaseClient()
        
        // 먼저 로컬 스토리지에서 세션 확인
        const storedSession = localStorage.getItem(`sb-${window.location.hostname.replace(/\./g, '-')}-auth-token`)
        console.log('Stored session in localStorage:', !!storedSession)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        console.log('Initial session result:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          hasStoredSession: !!storedSession,
          error: error?.message 
        })

        if (error) {
          console.error('Session check error:', error)
          // 에러가 있어도 로컬 스토리지에 세션이 있다면 재시도
          if (storedSession) {
            console.log('Retrying session check due to stored session...')
            setTimeout(() => getInitialSession(), 1000)
            return
          }
          setSession(null)
          setUser(null)
        } else {
          // 세션과 사용자가 모두 유효한 경우에만 설정
          if (session && session.user && session.access_token) {
            console.log('Valid session found:', session.user.email)
            setSession(session)
            setUser(session.user)
          } else if (storedSession) {
            // 세션이 없지만 로컬 스토리지에 있다면 재시도
            console.log('No session but stored session exists, retrying...')
            setTimeout(() => getInitialSession(), 500)
            return
          } else {
            console.log('No valid session found')
            setSession(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Failed to get initial session:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    let subscription: any = null
    try {
      const supabase = getSupabaseClient()
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return
          
          console.log('Auth state changed:', { 
            event, 
            hasSession: !!session,
            hasUser: !!session?.user,
            userEmail: session?.user?.email 
          })

          // 세션과 사용자가 모두 유효한 경우에만 설정
          if (session && session.user && session.access_token) {
            console.log('Setting valid user:', session.user.email)
            setSession(session)
            setUser(session.user)
          } else {
            console.log('Clearing user session')
            setSession(null)
            setUser(null)
          }
          setLoading(false)
        }
      )
      subscription = authSubscription
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
      if (mounted) {
        setLoading(false)
      }
    }

    return () => {
      mounted = false
      clearTimeout(timeout)
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      if (error) throw error
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Email sign in error:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Email sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // 로그아웃 후 상태 초기화
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // 디버깅을 위한 추가 정보
  console.log('useAuth state:', { 
    loading, 
    hasUser: !!user, 
    userEmail: user?.email,
    hasSession: !!session 
  })

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut
  }
} 