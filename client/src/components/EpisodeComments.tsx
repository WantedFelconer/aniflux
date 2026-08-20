import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export interface EpisodeComment {
  id: number
  animeId: number
  episodeNumber: number
  userId: number
  parentId?: number | null
  text: string
  isSpoiler: boolean
  likesCount: number
  createdAt: string
  user: {
    id: number
    username: string
    avatarUrl?: string | null
    avatarInitial: string
    level: number
    role: string
  }
  hasLiked: boolean
  replies?: EpisodeComment[]
}

interface EpisodeCommentsProps {
  animeId: number
  episodeNumber: number
  animeTitle: string
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function EpisodeComments({
  animeId,
  episodeNumber,
  animeTitle,
}: EpisodeCommentsProps) {
  const { isAuthenticated, user: authUser } = useAuth()
  const [comments, setComments] = useState<EpisodeComment[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sort, setSort] = useState<'top' | 'newest'>('newest')

  // New comment state
  const [commentText, setCommentText] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Active reply box state (stores parent comment id)
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyIsSpoiler, setReplyIsSpoiler] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  // Revealed spoilers tracker (set of comment IDs)
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set())

  // Fetch comments for this specific episode
  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const token = localStorage.getItem('aniflux_auth_token')
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (authUser?.id) headers['X-User-Id'] = String(authUser.id)

      const res = await fetch(
        `/api/anime/${animeId}/episodes/${episodeNumber}/comments?sort=${sort}`,
        { headers, credentials: 'include' }
      )
      if (res.ok) {
        const json = await res.json()
        setComments(json.comments || [])
        setTotalComments(json.totalComments || (json.comments || []).length)
      }
    } catch {
      setErrorMsg('Failed to load discussion comments.')
    } finally {
      setIsLoading(false)
    }
  }, [animeId, episodeNumber, sort, authUser])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // Submit top-level comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || isSubmitting) return

    if (!isAuthenticated) {
      setErrorMsg('Please log in to post comments.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const token = localStorage.getItem('aniflux_auth_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (authUser?.id) headers['X-User-Id'] = String(authUser.id)

      const res = await fetch(`/api/anime/${animeId}/episodes/${episodeNumber}/comments`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          commentText: commentText.trim(),
          isSpoiler,
        }),
      })

      const json = await res.json()

      if (res.ok && json.comment) {
        setComments(prev => [json.comment, ...prev])
        setTotalComments(prev => prev + 1)
        setCommentText('')
        setIsSpoiler(false)
      } else {
        setErrorMsg(json.error || 'Failed to post comment.')
      }
    } catch {
      setErrorMsg('Network error posting comment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit nested reply
  const handlePostReply = async (parentId: number) => {
    if (!replyText.trim() || isReplying) return

    setIsReplying(true)
    try {
      const token = localStorage.getItem('aniflux_auth_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (authUser?.id) headers['X-User-Id'] = String(authUser.id)

      const res = await fetch(`/api/anime/${animeId}/episodes/${episodeNumber}/comments`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          commentText: replyText.trim(),
          isSpoiler: replyIsSpoiler,
          parentId,
        }),
      })

      const json = await res.json()

      if (res.ok && json.comment) {
        setComments(prev =>
          prev.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), json.comment],
              }
            }
            return c
          })
        )
        setTotalComments(prev => prev + 1)
        setReplyText('')
        setReplyIsSpoiler(false)
        setActiveReplyId(null)
      }
    } catch {
      // ignore
    } finally {
      setIsReplying(false)
    }
  }

  // Toggle Like on Comment
  const handleToggleLike = async (commentId: number) => {
    if (!isAuthenticated) return

    // Optimistic UI update
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          const nextLiked = !c.hasLiked
          return {
            ...c,
            hasLiked: nextLiked,
            likesCount: nextLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
          }
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => {
              if (r.id === commentId) {
                const nextLiked = !r.hasLiked
                return {
                  ...r,
                  hasLiked: nextLiked,
                  likesCount: nextLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
                }
              }
              return r
            }),
          }
        }
        return c
      })
    )

    try {
      const token = localStorage.getItem('aniflux_auth_token')
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (authUser?.id) headers['X-User-Id'] = String(authUser.id)

      await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers,
        credentials: 'include',
      })
    } catch {
      // Revert if error
    }
  }

  // Delete Comment
  const handleDeleteComment = async (commentId: number, isReply = false, parentId?: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const token = localStorage.getItem('aniflux_auth_token')
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (authUser?.id) headers['X-User-Id'] = String(authUser.id)

      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })

      if (res.ok) {
        if (isReply && parentId) {
          setComments(prev =>
            prev.map(c => (c.id === parentId ? { ...c, replies: c.replies?.filter(r => r.id !== commentId) } : c))
          )
        } else {
          setComments(prev => prev.filter(c => c.id !== commentId))
        }
        setTotalComments(prev => Math.max(0, prev - 1))
      }
    } catch {}
  }

  const toggleSpoilerReveal = (id: number) => {
    setRevealedSpoilers(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6 fade-in mt-2">
      {/* Header bar with total comments & Sort toggle */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#23252b' }}>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white flex items-center gap-2">
            <span>💬</span> Episode {episodeNumber} Discussion
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(109,59,255,0.15)', color: '#c084fc' }}
          >
            {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: '#111216', border: '1px solid #1f222e' }}>
          <button
            onClick={() => setSort('newest')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: sort === 'newest' ? '#6d3bff' : 'transparent',
              color: sort === 'newest' ? 'white' : '#888',
            }}
          >
            ⏱️ Newest
          </button>
          <button
            onClick={() => setSort('top')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: sort === 'top' ? '#6d3bff' : 'transparent',
              color: sort === 'top' ? 'white' : '#888',
            }}
          >
            🔥 Top
          </button>
        </div>
      </div>

      {/* Comment Input Box */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: '#111216', border: '1px solid #23252b' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
            >
              {authUser?.avatarInitial || authUser?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-white truncate">{authUser?.username}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30">
                Lv. {authUser?.level || 1}
              </span>
            </div>
          </div>

          <textarea
            placeholder={`What did you think of Episode ${episodeNumber}? Share your thoughts (supports spoiler tag)...`}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            rows={3}
            className="w-full bg-black/40 border rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors resize-none"
            style={{ borderColor: '#23252b' }}
          />

          {errorMsg && (
            <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-300 hover:text-white">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={e => setIsSpoiler(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-black/50 border-gray-600"
              />
              <span className={isSpoiler ? 'text-red-400 font-bold' : ''}>
                ⚠️ Contains Spoiler
              </span>
            </label>

            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment 🚀'}
            </button>
          </div>
        </form>
      ) : (
        /* Guest Sign-In Banner */
        <div
          className="p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          style={{ background: 'rgba(109,59,255,0.08)', border: '1px solid rgba(109,59,255,0.25)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-lg shrink-0">
              🔒
            </div>
            <div>
              <p className="text-sm font-bold text-white">Join the Episode {episodeNumber} Discussion</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Only registered users can post comments, upvote, and reply to fellow anime fans.
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/20 border border-purple-500/40">
            Sign In to Comment
          </span>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <span className="text-xs font-medium">Loading Episode {episodeNumber} comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 p-6 rounded-2xl text-center" style={{ background: '#111216', border: '1px solid #1f2128' }}>
          <span className="text-3xl mb-2">💬</span>
          <h4 className="text-sm font-bold text-white">No comments on this episode yet</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Be the first to share your thoughts about Episode {episodeNumber} of {animeTitle}!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map(c => {
            const isRevealed = revealedSpoilers.has(c.id)
            const isOwner = authUser?.id === c.userId || authUser?.role === 'admin'

            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl flex flex-col gap-3 transition-all"
                style={{ background: '#111216', border: '1px solid #1f2128' }}
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow"
                      style={{
                        background: `hsl(${(c.userId * 85) % 360}, 65%, 45%)`,
                      }}
                    >
                      {c.user.avatarInitial}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-xs font-bold text-white truncate">{c.user.username}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30">
                        Lv. {c.user.level}
                      </span>
                      {c.user.role === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold text-purple-300 bg-purple-500/20 border border-purple-500/40">
                          🛡️ Admin
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500">· {timeAgo(c.createdAt)}</span>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/5"
                      title="Delete comment"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Comment Body */}
                <div className="pl-11">
                  {c.isSpoiler && !isRevealed ? (
                    <div
                      onClick={() => toggleSpoilerReveal(c.id)}
                      className="p-3 rounded-xl cursor-pointer select-none transition-all flex items-center justify-between gap-3 text-xs"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px dashed rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                      }}
                    >
                      <span className="font-semibold flex items-center gap-1.5">
                        <span>⚠️</span> This comment contains spoilers for Episode {episodeNumber}.
                      </span>
                      <span className="underline font-bold text-[11px] shrink-0">Click to reveal</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                        {c.text}
                      </p>
                      {c.isSpoiler && isRevealed && (
                        <span
                          onClick={() => toggleSpoilerReveal(c.id)}
                          className="inline-block mt-1 text-[10px] text-gray-500 hover:text-gray-300 cursor-pointer underline"
                        >
                          Hide spoiler
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions: Likes & Reply */}
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <button
                      onClick={() => handleToggleLike(c.id)}
                      disabled={!isAuthenticated}
                      className={`flex items-center gap-1.5 font-bold transition-all px-2 py-1 rounded-lg ${
                        c.hasLiked
                          ? 'text-pink-400 bg-pink-500/10 border border-pink-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill={c.hasLiked ? '#f472b6' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span>{c.likesCount}</span>
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          setActiveReplyId(activeReplyId === c.id ? null : c.id)
                          setReplyText('')
                        }}
                        className="text-gray-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-1"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 17 4 12 9 7" />
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                        </svg>
                        <span>Reply</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Reply Box */}
                  {activeReplyId === c.id && (
                    <div className="mt-3 p-3 rounded-xl flex flex-col gap-2 border bg-black/40" style={{ borderColor: '#23252b' }}>
                      <textarea
                        placeholder={`Reply to @${c.user.username}...`}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={2}
                        className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none resize-none"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-400">
                          <input
                            type="checkbox"
                            checked={replyIsSpoiler}
                            onChange={e => setReplyIsSpoiler(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-purple-600 bg-black/50 border-gray-600"
                          />
                          <span>Spoiler</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handlePostReply(c.id)}
                            disabled={!replyText.trim() || isReplying}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                          >
                            {isReplying ? 'Replying...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2.5 pl-3 border-l-2" style={{ borderColor: 'rgba(109,59,255,0.3)' }}>
                      {c.replies.map(reply => {
                        const replySpoilerRevealed = revealedSpoilers.has(reply.id)
                        const isReplyOwner = authUser?.id === reply.userId || authUser?.role === 'admin'

                        return (
                          <div
                            key={reply.id}
                            className="p-3 rounded-xl flex flex-col gap-2"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1c24' }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow"
                                  style={{ background: `hsl(${(reply.userId * 85) % 360}, 65%, 45%)` }}
                                >
                                  {reply.user.avatarInitial}
                                </div>
                                <span className="text-xs font-bold text-white truncate">{reply.user.username}</span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30">
                                  Lv. {reply.user.level}
                                </span>
                                <span className="text-[10px] text-gray-500">· {timeAgo(reply.createdAt)}</span>
                              </div>

                              {isReplyOwner && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id, true, c.id)}
                                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {reply.isSpoiler && !replySpoilerRevealed ? (
                              <div
                                onClick={() => toggleSpoilerReveal(reply.id)}
                                className="p-2 rounded-lg cursor-pointer text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 font-medium flex items-center justify-between"
                              >
                                <span>⚠️ Spoiler reply</span>
                                <span className="underline font-bold">Reveal</span>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-300 whitespace-pre-wrap">{reply.text}</p>
                            )}

                            <div className="flex items-center gap-3 text-xs pt-0.5">
                              <button
                                onClick={() => handleToggleLike(reply.id)}
                                disabled={!isAuthenticated}
                                className={`flex items-center gap-1 font-bold text-[11px] ${
                                  reply.hasLiked ? 'text-pink-400' : 'text-gray-500 hover:text-gray-300'
                                }`}
                              >
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill={reply.hasLiked ? '#f472b6' : 'none'}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span>{reply.likesCount}</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
