import type { PrismaClient } from '@prisma/client'
import { TAuthIdVO } from '../domain/model/mPlan'
import type { GetPlansRequestDTO } from './dto/request/setting/getPlans'
import { GetPlansResponseDTO } from './dto/response/setting/getPlans'
import type { IMPlanRepository } from './interface/mPlan'

export class SettingService {
  readonly planRepository: IMPlanRepository
  readonly prisma: PrismaClient

  constructor(planRepository: IMPlanRepository, prisma: PrismaClient) {
    this.planRepository = planRepository
    this.prisma = prisma
  }

  async getPlans(dto: GetPlansRequestDTO): Promise<GetPlansResponseDTO> {
    try {
      const entities = await this.prisma.$transaction(async (tx) => {
        const { authId } = dto
        const vo = new TAuthIdVO(authId)

        return await this.planRepository.findAll(tx, vo)
      })

      return new GetPlansResponseDTO(entities)
    } catch (error) {
      console.error('Error in SettingService.getPlans:', error)
      throw error
    }
  }
}
