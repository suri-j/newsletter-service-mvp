import { supabase } from './supabase'
import { Database } from './database.types'

type Newsletter = Database['public']['Tables']['newsletters']['Row']
type Subscriber = Database['public']['Tables']['subscribers']['Row']
type NewsletterSend = Database['public']['Tables']['newsletter_sends']['Row']

// Newsletter operations
export const newsletterOperations = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(newsletter: Database['public']['Tables']['newsletters']['Insert']) {
    const { data, error } = await supabase
      .from('newsletters')
      .insert(newsletter)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Database['public']['Tables']['newsletters']['Update']) {
    const { data, error } = await supabase
      .from('newsletters')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('newsletters')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Subscriber operations
export const subscriberOperations = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .order('subscribed_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(subscriber: Database['public']['Tables']['subscribers']['Insert']) {
    const { data, error } = await supabase
      .from('subscribers')
      .insert(subscriber)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createMany(subscribers: Database['public']['Tables']['subscribers']['Insert'][]) {
    const { data, error } = await supabase
      .from('subscribers')
      .insert(subscribers)
      .select()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Database['public']['Tables']['subscribers']['Update']) {
    const { data, error } = await supabase
      .from('subscribers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async unsubscribe(id: string) {
    const { data, error } = await supabase
      .from('subscribers')
      .update({ 
        is_active: false, 
        unsubscribed_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Newsletter send operations
export const newsletterSendOperations = {
  async create(send: Database['public']['Tables']['newsletter_sends']['Insert']) {
    const { data, error } = await supabase
      .from('newsletter_sends')
      .insert(send)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createMany(sends: Database['public']['Tables']['newsletter_sends']['Insert'][]) {
    const { data, error } = await supabase
      .from('newsletter_sends')
      .insert(sends)
      .select()
    
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: Database['public']['Enums']['send_status'], error_message?: string) {
    const updates: Database['public']['Tables']['newsletter_sends']['Update'] = {
      status,
      error_message
    }

    if (status === 'sent') {
      updates.sent_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('newsletter_sends')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByNewsletter(newsletterId: string) {
    const { data, error } = await supabase
      .from('newsletter_sends')
      .select(`
        *,
        subscriber:subscribers(*)
      `)
      .eq('newsletter_id', newsletterId)
    
    if (error) throw error
    return data
  }
}

// Statistics operations
export const statsOperations = {
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .rpc('get_newsletter_stats', { user_uuid: userId })
    
    if (error) throw error
    return data[0] || {
      total_newsletters: 0,
      total_subscribers: 0,
      total_sends: 0,
      this_month_sends: 0
    }
  }
}

// User operations
export const userOperations = {
  async getOrCreate(userId: string, email: string, name?: string, avatarUrl?: string) {
    // First try to get existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingUser) {
      return existingUser
    }

    // Create new user if doesn't exist
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        avatar_url: avatarUrl
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(userId: string, updates: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Individual function exports for easier importing
export const getAllNewsletters = newsletterOperations.getAll
export const getNewsletterById = newsletterOperations.getById
export const createNewsletter = newsletterOperations.create
export const updateNewsletter = newsletterOperations.update
export const deleteNewsletter = newsletterOperations.delete

// Subscriber individual function exports
export const getAllSubscribers = subscriberOperations.getAll
export const createSubscriber = subscriberOperations.create
export const createManySubscribers = subscriberOperations.createMany
export const updateSubscriber = subscriberOperations.update
export const deleteSubscriber = subscriberOperations.delete
export const unsubscribeSubscriber = subscriberOperations.unsubscribe

// Newsletter send individual function exports
export const createNewsletterSend = newsletterSendOperations.create
export const createManyNewsletterSends = newsletterSendOperations.createMany
export const updateNewsletterSendStatus = newsletterSendOperations.updateStatus
export const getNewsletterSendsByNewsletter = newsletterSendOperations.getByNewsletter

// Stats individual function exports
export const getUserStats = statsOperations.getUserStats

// User individual function exports
export const getOrCreateUser = userOperations.getOrCreate
export const updateUser = userOperations.update 