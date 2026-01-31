import { z } from 'zod'

/**
 * 必須文字列バリデータ
 * 空文字列や空白のみの文字列をundefinedに変換し、z.string()の必須バリデーションを効かせる
 */
export const required = () =>
  z.preprocess((v) => {
    if (typeof v !== 'string') {
      return v
    }
    return v.trim() || undefined
  }, z.string())
