import { CHANNELS } from '../../constants'

export const channelDisplayName = (channelId) => {
  const channel = CHANNELS.find((item) => item.id === channelId)
  return (channel?.name || channelId || '').replace(/\s*\([^)]*\)/g, '')
}

export const normalizeChannels = (channels = []) => (Array.isArray(channels) ? channels : [channels]).filter(Boolean)
