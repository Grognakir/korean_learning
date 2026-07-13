import type { Topic } from "@/lib/types";

export const topics: Topic[] = [
  {
    id: "u01",
    unit: 1,
    titleKo: "인사와 소개",
    titleRu: "Приветствия и знакомство",
    vocabDomainIds: ["greetings", "people"],
    subtopics: [
      {
        id: "u01-s1",
        titleKo: "인사하기",
        titleRu: "Здороваться",
        grammarIds: ["g-n-imnida", "g-i-ga", "g-eun-neun-1"],
      },
      {
        id: "u01-s2",
        titleKo: "자기소개하기",
        titleRu: "Представляться",
        grammarIds: ["g-i-ga-anida", "g-do"],
      },
    ],
  },
  {
    id: "u02",
    unit: 2,
    titleKo: "학교와 집",
    titleRu: "Школа и дом",
    vocabDomainIds: ["classroom", "school"],
    subtopics: [
      {
        id: "u02-s1",
        titleKo: "교실 물건을 말하기",
        titleRu: "Называть предметы в классе",
        grammarIds: ["g-i-geu-jeo", "g-ui"],
      },
      {
        id: "u02-s2",
        titleKo: "학교 시설물 위치 설명하기",
        titleRu: "Объяснять расположение в школе",
        grammarIds: ["g-e-1", "g-itda-eopda"],
      },
    ],
  },
  {
    id: "u03",
    unit: 3,
    titleKo: "학교 생활",
    titleRu: "Школьная жизнь",
    vocabDomainIds: ["school-life", "school"],
    subtopics: [
      {
        id: "u03-s1",
        titleKo: "학교생활을 말하기",
        titleRu: "Рассказывать о школьной жизни",
        grammarIds: ["g-seumnida", "g-eul-reul", "g-man"],
      },
      {
        id: "u03-s2",
        titleKo: "친구와 인사하기",
        titleRu: "Здороваться с друзьями",
        grammarIds: ["g-e-gada-oda", "g-numbers-1"],
      },
    ],
  },
  {
    id: "u04",
    unit: 4,
    titleKo: "일상 생활",
    titleRu: "Повседневная жизнь",
    vocabDomainIds: ["daily", "calendar", "time"],
    subtopics: [
      {
        id: "u04-s1",
        titleKo: "일상생활에 대해 말하기",
        titleRu: "Говорить о повседневной жизни",
        grammarIds: ["g-wa-gwa", "g-hago", "g-eseo"],
      },
      {
        id: "u04-s2",
        titleKo: "달력을 보고 말하기",
        titleRu: "Говорить по календарю",
        grammarIds: ["g-numbers-2", "g-e-2"],
      },
    ],
  },
  {
    id: "u05",
    unit: 5,
    titleKo: "하루 일과",
    titleRu: "Распорядок дня",
    vocabDomainIds: ["daily", "time"],
    subtopics: [
      {
        id: "u05-s1",
        titleKo: "하루 일과를 설명하기",
        titleRu: "Описывать распорядок дня",
        grammarIds: ["g-ayo-1", "g-ieyo", "g-numbers-3"],
      },
      {
        id: "u05-s2",
        titleKo: "시간 정보를 묻기",
        titleRu: "Спрашивать о времени",
        grammarIds: ["g-buteo-kkaji", "g-an-ji-anta"],
      },
    ],
  },
  {
    id: "u06",
    unit: 6,
    titleKo: "주말",
    titleRu: "Выходные",
    vocabDomainIds: ["weekend"],
    subtopics: [
      {
        id: "u06-s1",
        titleKo: "지난 일에 대해 말하기",
        titleRu: "Говорить о прошлом",
        grammarIds: ["g-asseot", "g-go-1"],
      },
      {
        id: "u06-s2",
        titleKo: "경험을 말하기",
        titleRu: "Рассказывать об опыте",
        grammarIds: ["g-a-boda", "g-eu-irregular"],
      },
    ],
  },
  {
    id: "u07",
    unit: 7,
    titleKo: "날씨와 계절",
    titleRu: "Погода и времена года",
    vocabDomainIds: ["weather", "seasons"],
    subtopics: [
      {
        id: "u07-s1",
        titleKo: "날씨와 계절 표현하기",
        titleRu: "Описывать погоду и сезоны",
        grammarIds: ["g-eun-neun-2", "g-aseo-1", "g-b-irregular"],
      },
      {
        id: "u07-s2",
        titleKo: "계절 활동을 말하기",
        titleRu: "Говорить о сезонных занятиях",
        grammarIds: ["g-euro-1", "g-ureo-gada"],
      },
    ],
  },
  {
    id: "u08",
    unit: 8,
    titleKo: "계획",
    titleRu: "Планы",
    vocabDomainIds: ["plans", "weekend"],
    subtopics: [
      {
        id: "u08-s1",
        titleKo: "계획을 말하기",
        titleRu: "Говорить о планах",
        grammarIds: ["g-eul-geoyeyo-1", "g-go-2"],
      },
      {
        id: "u08-s2",
        titleKo: "방학 계획을 세우기",
        titleRu: "Составлять план каникул",
        grammarIds: ["g-gi-jeone", "g-eun-hue", "g-dongan"],
      },
    ],
  },
  {
    id: "u09",
    unit: 9,
    titleKo: "물건 사기",
    titleRu: "Покупки",
    vocabDomainIds: ["shopping"],
    subtopics: [
      {
        id: "u09-s1",
        titleKo: "물건을 사기",
        titleRu: "Покупать вещи",
        grammarIds: ["g-numbers-4", "g-useyo"],
      },
      {
        id: "u09-s2",
        titleKo: "선물 추천하기",
        titleRu: "Рекомендовать подарок",
        grammarIds: ["g-irang", "g-go-itda-1", "g-ege-hante"],
      },
    ],
  },
  {
    id: "u10",
    unit: 10,
    titleKo: "음식",
    titleRu: "Еда",
    vocabDomainIds: ["food"],
    subtopics: [
      {
        id: "u10-s1",
        titleKo: "음식을 추천하기",
        titleRu: "Рекомендовать еду",
        grammarIds: ["g-eulkkayo-1", "g-ipsida", "g-unikka-1"],
      },
      {
        id: "u10-s2",
        titleKo: "음식을 주문하기",
        titleRu: "Заказывать еду",
        grammarIds: ["g-go-sipda", "g-get-1"],
      },
    ],
  },
  {
    id: "u11",
    unit: 11,
    titleKo: "전화",
    titleRu: "Телефон",
    vocabDomainIds: ["phone"],
    subtopics: [
      {
        id: "u11-s1",
        titleKo: "전화를 걸고 받기",
        titleRu: "Звонить и отвечать",
        grammarIds: ["g-jiyo", "g-get-2", "g-a-juda"],
      },
      {
        id: "u11-s2",
        titleKo: "전화를 바꿔주기",
        titleRu: "Передавать трубку",
        grammarIds: ["g-umyeon", "g-d-irregular"],
      },
    ],
  },
  {
    id: "u12",
    unit: 12,
    titleKo: "약속",
    titleRu: "Договорённости",
    vocabDomainIds: ["plans", "time"],
    subtopics: [
      {
        id: "u12-s1",
        titleKo: "약속 시간을 정하기",
        titleRu: "Назначать время встречи",
        grammarIds: ["g-aseo-2", "g-eul-su-itda"],
      },
      {
        id: "u12-s2",
        titleKo: "약속 변경 및 사과하기",
        titleRu: "Переносить встречу и извиняться",
        grammarIds: ["g-eulkkayo-2", "g-eul-geoyeyo-2", "g-eulgeyo"],
      },
    ],
  },
  {
    id: "u13",
    unit: 13,
    titleKo: "교통",
    titleRu: "Транспорт",
    vocabDomainIds: ["transport", "school"],
    subtopics: [
      {
        id: "u13-s1",
        titleKo: "교통편을 묻기",
        titleRu: "Спрашивать о транспорте",
        grammarIds: ["g-ayo-2", "g-euro-2", "g-l-irregular"],
      },
      {
        id: "u13-s2",
        titleKo: "길 찾기",
        titleRu: "Искать дорогу",
        grammarIds: ["g-geona", "g-mot"],
      },
    ],
  },
  {
    id: "u14",
    unit: 14,
    titleKo: "공공 장소",
    titleRu: "Общественные места",
    vocabDomainIds: ["shopping", "people"],
    subtopics: [
      {
        id: "u14-s1",
        titleKo: "은행에서 통장 만들기",
        titleRu: "Открывать счёт в банке",
        grammarIds: ["g-uryeogo", "g-kkeseo", "g-usi"],
      },
      {
        id: "u14-s2",
        titleKo: "우체국에서 소포 보내기",
        titleRu: "Отправлять посылку на почте",
        grammarIds: ["g-aya-doeda", "g-ji-malda"],
      },
    ],
  },
  {
    id: "u15",
    unit: 15,
    titleKo: "건강",
    titleRu: "Здоровье",
    vocabDomainIds: ["health"],
    subtopics: [
      {
        id: "u15-s1",
        titleKo: "아픈 증상을 말하기",
        titleRu: "Описывать симптомы",
        grammarIds: ["g-boda", "g-jiman", "g-eun-n"],
      },
      {
        id: "u15-s2",
        titleKo: "약국에서 약을 사기",
        titleRu: "Покупать лекарство в аптеке",
        grammarIds: ["g-ado-doeda", "g-umyeon-an-doeda"],
      },
    ],
  },
  {
    id: "u16",
    unit: 16,
    titleKo: "가족",
    titleRu: "Семья",
    vocabDomainIds: ["family", "people"],
    subtopics: [
      {
        id: "u16-s1",
        titleKo: "가족을 소개하기",
        titleRu: "Представлять семью",
        grammarIds: ["g-eun-neun-eul-n", "g-eunde"],
      },
      {
        id: "u16-s2",
        titleKo: "고향 방문을 준비하기",
        titleRu: "Готовиться к визиту на родину",
        grammarIds: ["g-kke", "g-a-deurida"],
      },
    ],
  },
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
