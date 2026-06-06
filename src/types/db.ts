// Supabase 数据表的行类型，与 supabase/schema.sql 保持一致

export interface Profile {
  id: string // = auth.users.id
  username: string
  avatar_url: string | null
  created_at: string
}

export interface Rating {
  id: string
  user_id: string
  subject_id: number // Bangumi 条目 id
  score: number // 1-10
  updated_at: string
}

export interface Comment {
  id: string
  user_id: string
  subject_id: number
  parent_id: string | null // 一级回复指向父评论
  content: string
  created_at: string
  // 关联查询时带出的作者资料
  profiles?: Pick<Profile, 'username' | 'avatar_url'> | null
}

/** 某条目的本站评分聚合 */
export interface ScoreAggregate {
  average: number
  count: number
}
