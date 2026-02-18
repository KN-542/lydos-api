import { describe, expect, it, mock } from 'bun:test'
import { MModelEntity } from '../domain/model/mModel'
import { TChatHistoryEntity } from '../domain/model/tChatHistory'
import { CreateTChatSessionEntity, TChatSessionEntity } from '../domain/model/tChatSession'
import { TUserAggregation } from '../domain/model/tUser'
import { AppError } from '../lib/error'
import { ChatService } from './chat'
import { CreateSessionRequestDTO } from './dto/request/chat/createSession'
import { DeleteSessionRequestDTO } from './dto/request/chat/deleteSession'
import { GetMessagesRequestDTO } from './dto/request/chat/getMessages'
import { GetModelsRequestDTO } from './dto/request/chat/getModels'
import { GetSessionsRequestDTO } from './dto/request/chat/getSessions'
import { StreamMessageRequestDTO } from './dto/request/chat/streamMessage'

// streamChat を事前にモック（Bun が mock.module を import より先に実行する）
const mockStreamChat = mock(
  (_messages: unknown[], _modelId: string, _provider: string, _onToken: unknown) =>
    Promise.resolve({ content: 'AI response', inputTokens: 10, outputTokens: 20 })
)
mock.module('../lib/llm', () => ({ streamChat: mockStreamChat }))

// prisma.$transaction はコールバックをそのまま実行して結果を返す
const mockTx = {} as never
const mockPrisma = {
  $transaction: (fn: (tx: never) => unknown) => fn(mockTx),
} as never

// --- テスト用データ生成ヘルパー ---

const makeModelEntity = (id = 1) =>
  new MModelEntity(id, 'Gemini 2.0 Flash', 'gemini-2.0-flash', 'gemini', '#4285F4', true)

const makeSessionEntity = (id = 'session-1') =>
  new TChatSessionEntity(id, 'テストチャット', 1, 'Gemini 2.0 Flash')

const makeSessionAgg = (sessionId = 'session-1') => ({
  session: makeSessionEntity(sessionId),
  model: makeModelEntity(),
})

const makeHistoryEntity = (id: number, role: 'user' | 'assistant' = 'user') =>
  new TChatHistoryEntity(id, role, 'メッセージ内容', null, null, new Date('2024-01-01'))

const makeUser = (userId = 1, authId = 'auth-1', planId = 1) =>
  new TUserAggregation(
    userId,
    authId,
    'Test User',
    'test@example.com',
    null,
    planId,
    null,
    null,
    null,
    new Date(),
    new Date()
  )

// --- サービスファクトリ ---

import { MPlanModelEntity } from '../domain/model/mPlanModel'

type Repos = {
  findAllByAuthId?: () => Promise<MModelEntity[]>
  findModel?: (tx: never, id: number) => Promise<MModelEntity | null>
  findPlanModel?: () => Promise<MPlanModelEntity | null>
  findAllSessions?: () => Promise<TChatSessionEntity[]>
  findSession?: () => Promise<ReturnType<typeof makeSessionAgg> | null>
  updateSession?: () => Promise<void>
  deleteSession?: () => Promise<void>
  createSession?: () => Promise<CreateTChatSessionEntity>
  findMessages?: () => Promise<TChatHistoryEntity[]>
  createMessage?: () => Promise<TChatHistoryEntity>
  findUser?: () => Promise<TUserAggregation | null>
}

const makeService = (repos: Repos = {}) =>
  new ChatService(
    {
      findAllByAuthId: mock(repos.findAllByAuthId ?? (() => Promise.resolve([]))),
      find: mock(repos.findModel ?? ((_tx, _id) => Promise.resolve(null))),
    },
    {
      find: mock(repos.findPlanModel ?? (() => Promise.resolve(new MPlanModelEntity(1, 1)))),
    },
    {
      findAllByAuthId: mock(repos.findAllSessions ?? (() => Promise.resolve([]))),
      find: mock(repos.findSession ?? (() => Promise.resolve(null))),
      create: mock(
        repos.createSession ?? (() => Promise.resolve(new CreateTChatSessionEntity('new-session')))
      ),
      update: mock(repos.updateSession ?? (() => Promise.resolve())),
      delete: mock(repos.deleteSession ?? (() => Promise.resolve())),
    },
    {
      findMany: mock(repos.findMessages ?? (() => Promise.resolve([]))),
      create: mock(
        repos.createMessage ?? (() => Promise.resolve(makeHistoryEntity(1, 'assistant')))
      ),
    },
    {
      findByAuthId: mock(repos.findUser ?? (() => Promise.resolve(null))),
      update: mock(() => Promise.resolve()),
    },
    mockPrisma
  )

// =====================================================================

describe('ChatService.getModels', () => {
  it('モデル一覧を GetModelsResponseDTO として返す', async () => {
    const entities = [makeModelEntity(1), makeModelEntity(2)]
    const service = makeService({ findAllByAuthId: () => Promise.resolve(entities) })

    const result = await service.getModels(new GetModelsRequestDTO('auth-1'))

    expect(result.models).toHaveLength(2)
    expect(result.models[0].id).toBe(1)
    expect(result.models[1].id).toBe(2)
  })

  it('モデルが存在しない場合は空配列を返す', async () => {
    const service = makeService({ findAllByAuthId: () => Promise.resolve([]) })
    const result = await service.getModels(new GetModelsRequestDTO('auth-1'))
    expect(result.models).toEqual([])
  })

  it('repository が throw した場合はそのまま再スローする', async () => {
    const service = makeService({ findAllByAuthId: () => Promise.reject(new Error('DB error')) })
    expect(service.getModels(new GetModelsRequestDTO('auth-1'))).rejects.toThrow('DB error')
  })
})

// =====================================================================

describe('ChatService.getSessions', () => {
  it('セッション一覧を GetSessionsResponseDTO として返す', async () => {
    const entities = [makeSessionEntity('s1'), makeSessionEntity('s2')]
    const service = makeService({ findAllSessions: () => Promise.resolve(entities) })

    const result = await service.getSessions(new GetSessionsRequestDTO('auth-1'))

    expect(result.sessions).toHaveLength(2)
    expect(result.sessions[0].id).toBe('s1')
    expect(result.sessions[1].id).toBe('s2')
  })

  it('セッションが存在しない場合は空配列を返す', async () => {
    const service = makeService()
    const result = await service.getSessions(new GetSessionsRequestDTO('auth-1'))
    expect(result.sessions).toEqual([])
  })
})

// =====================================================================

describe('ChatService.getMessages', () => {
  it('メッセージ一覧を GetMessagesResponseDTO として返す', async () => {
    const entities = [makeHistoryEntity(1, 'user'), makeHistoryEntity(2, 'assistant')]
    const service = makeService({ findMessages: () => Promise.resolve(entities) })

    const result = await service.getMessages(new GetMessagesRequestDTO('auth-1', 'session-1'))

    expect(result.messages).toHaveLength(2)
    expect(result.messages[0].id).toBe(1)
    expect(result.messages[0].role).toBe('user')
    expect(result.messages[1].role).toBe('assistant')
  })

  it('メッセージが存在しない場合は空配列を返す', async () => {
    const service = makeService()
    const result = await service.getMessages(new GetMessagesRequestDTO('auth-1', 'session-1'))
    expect(result.messages).toEqual([])
  })
})

// =====================================================================

describe('ChatService.createSession', () => {
  it('セッションを作成して CreateSessionResponseDTO を返す', async () => {
    const service = makeService({
      findUser: () => Promise.resolve(makeUser()),
      findModel: (_tx, _id) => Promise.resolve(makeModelEntity()),
      createSession: () => Promise.resolve(new CreateTChatSessionEntity('new-session-id')),
    })

    const result = await service.createSession(
      new CreateSessionRequestDTO('auth-1', 1, 'テストチャット')
    )

    expect(result.id).toBe('new-session-id')
  })

  it('ユーザーが存在しない場合は AppError(401) を投げる', async () => {
    const service = makeService({ findUser: () => Promise.resolve(null) })

    const error = await service
      .createSession(new CreateSessionRequestDTO('auth-1', 1))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(401)
  })

  it('モデルが存在しない場合は AppError(400) を投げる', async () => {
    const service = makeService({
      findUser: () => Promise.resolve(makeUser()),
      findModel: (_tx, _id) => Promise.resolve(null),
    })

    const error = await service
      .createSession(new CreateSessionRequestDTO('auth-1', 999))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(400)
  })

  it('プランで許可されていないモデルは AppError(403) を投げる', async () => {
    const service = makeService({
      findUser: () => Promise.resolve(makeUser()),
      findModel: (_tx, _id) => Promise.resolve(makeModelEntity(3)),
      findPlanModel: () => Promise.resolve(null), // プラン外
    })

    const error = await service
      .createSession(new CreateSessionRequestDTO('auth-1', 3))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(403)
  })
})

// =====================================================================

describe('ChatService.deleteSession', () => {
  it('chatSessionRepository.delete を呼び出す', async () => {
    const deleteMock = mock(() => Promise.resolve())
    const service = makeService({ deleteSession: deleteMock })

    await service.deleteSession(new DeleteSessionRequestDTO('auth-1', 'session-1'))

    expect(deleteMock).toHaveBeenCalledTimes(1)
  })
})

// =====================================================================

describe('ChatService.streamMessage', () => {
  const makeStreamService = () =>
    makeService({
      findSession: () => Promise.resolve(makeSessionAgg()),
      findMessages: () => Promise.resolve([makeHistoryEntity(1, 'user')]),
      createMessage: () => Promise.resolve(makeHistoryEntity(100, 'assistant')),
      updateSession: () => Promise.resolve(),
    })

  it('StreamMessageResponseDTO を返す', async () => {
    const service = makeStreamService()
    const onToken = mock(() => Promise.resolve())

    const result = await service.streamMessage(
      new StreamMessageRequestDTO('auth-1', 'session-1', 'こんにちは'),
      onToken
    )

    expect(result.messageId).toBe(100)
    expect(result.inputTokens).toBe(10)
    expect(result.outputTokens).toBe(20)
  })

  it('streamChat に正しい引数を渡す', async () => {
    mockStreamChat.mockClear()
    const service = makeStreamService()

    await service.streamMessage(
      new StreamMessageRequestDTO('auth-1', 'session-1', 'こんにちは'),
      mock(() => Promise.resolve())
    )

    expect(mockStreamChat).toHaveBeenCalledTimes(1)
    const [messages, modelId, provider] = mockStreamChat.mock.calls[0]
    expect(modelId).toBe('gemini-2.0-flash')
    expect(provider).toBe('gemini')
    // 既存履歴 + 今回のユーザーメッセージが含まれる
    expect((messages as { role: string }[]).at(-1)?.role).toBe('user')
  })

  it('セッションが見つからない場合は throw する', async () => {
    const service = makeService({ findSession: () => Promise.resolve(null) })

    expect(
      service.streamMessage(
        new StreamMessageRequestDTO('auth-1', 'session-1', 'こんにちは'),
        mock(() => Promise.resolve())
      )
    ).rejects.toThrow('Session not found')
  })
})
