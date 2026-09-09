export type AppId = 'home' | 'health' | 'money' | 'life' | 'inbox' | 'brein'

// @ai-why: Top-level modes inspired by Perplexity's Zoeken/Computer pattern.
// Each mode changes what the sidebar shows below the mode buttons.
// Carve = AI coach chat with domain switching. Wiki = knowledge base (future). Brein = coach memory management.
// Admin verschijnt alleen voor een beheerder; zie components/chat/ChatSidebar.tsx.
export type AppMode = 'carve' | 'wiki' | 'hiscores' | 'brein' | 'admin'
