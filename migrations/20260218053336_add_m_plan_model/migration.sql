-- CreateTable
CREATE TABLE "m_plan_model" (
    "planId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,

    CONSTRAINT "m_plan_model_pkey" PRIMARY KEY ("planId","modelId")
);

-- AddForeignKey
ALTER TABLE "m_plan_model" ADD CONSTRAINT "m_plan_model_planId_fkey" FOREIGN KEY ("planId") REFERENCES "m_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_plan_model" ADD CONSTRAINT "m_plan_model_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "m_model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
