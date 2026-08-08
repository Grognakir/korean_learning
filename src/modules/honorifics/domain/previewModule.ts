import { EXERCISE_TYPE_IDS, type LearningModuleDefinition } from "@/types";

/**
 * Draft architectural preview of 높임말. Not reviewed, not published, not approved.
 * Wired into the learning composition only when NODE_ENV === "development".
 */
export const honorificsPreviewModule = {
  id: "8885e19b-5179-4d61-95dc-12cabf916ef0",
  slug: "honorifics",
  title: {
    ko: "높임말 (미리보기)",
    ru: "Высшая речь (preview)",
  },
  description: {
    ko: "개발 전용 draft preview입니다. 검수·공개·승인되지 않은 임시 콘텐츠로 UI를 검증합니다.",
    ru: "Черновой architectural preview только для разработки. Контент не проверен, не опубликован и не утверждён — нужен, чтобы проверить общий UI.",
  },
  level: "1급",
  status: "draft",
  contentVersion: "0.1.0",
  sortOrder: 20,
  supportedExerciseTypes: EXERCISE_TYPE_IDS,
  topics: [
    {
      id: "eb0b7ac7-e7ee-4d97-9e90-112b0d398378",
      code: "grandparents-age",
      title: {
        ko: "조부모님 연세",
        ru: "Возраст дедушки и бабушки",
      },
      summary: {
        ko: "나이의 높임말 연세와 계시다 구성을 미리 봅니다.",
        ru: "Preview конструкций 연세 (возраст) и 계시다 применительно к дедушке и бабушке.",
      },
      level: "1급",
      status: "draft",
      contentVersion: "0.1.0",
      sortOrder: 10,
    },
    {
      id: "4f8a0504-ede8-42eb-993a-3e09a959601a",
      code: "profession",
      title: {
        ko: "직업",
        ru: "Профессия",
      },
      summary: {
        ko: "직업 관련 어휘와 공손한 질문 구성을 미리 봅니다.",
        ru: "Preview лексики профессий и вежливого вопроса о работе.",
      },
      level: "1급",
      status: "draft",
      contentVersion: "0.1.0",
      sortOrder: 20,
    },
  ],
} as const satisfies LearningModuleDefinition;
