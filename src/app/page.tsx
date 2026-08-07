import Link from "next/link";

import { Badge } from "@/components/ui";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

const STARTING_POINTS = [
  {
    description: "Посмотрите доступные направления и выберите первый модуль.",
    href: "/topics",
    index: "01",
    label: "Каталог",
    title: "Темы",
  },
  {
    description: "Начните короткую сессию и потренируйте активное вспоминание.",
    href: "/training",
    index: "02",
    label: "Практика",
    title: "Тренировка",
  },
  {
    description: "Вернитесь к сложным словам и закрепите их в удобном темпе.",
    href: "/review",
    index: "03",
    label: "Закрепление",
    title: "Повторение",
  },
] as const;

export default function HomePage() {
  return (
    <PageContainer className={styles.page}>
      <header aria-labelledby="hero-title" className={styles.hero}>
        <div className={styles.heroCopy}>
          <Badge tone="accent">한국어 · 1급</Badge>
          <div className={styles.heroHeading}>
            <h1 id="hero-title">Корейский язык — шаг за шагом</h1>
            <p>Короткие занятия, понятный прогресс и спокойное повторение без перегрузки.</p>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/topics">
              Выбрать тему
            </Link>
            <Link className={styles.secondaryAction} href="/progress">
              Посмотреть прогресс
            </Link>
          </div>
          <ul aria-label="Особенности обучения" className={styles.heroFacts}>
            <li>
              <strong>5 минут</strong>
              <span>на первый шаг</span>
            </li>
            <li>
              <strong>Свой темп</strong>
              <span>без дедлайнов</span>
            </li>
            <li>
              <strong>Ясный путь</strong>
              <span>без перегрузки</span>
            </li>
          </ul>
        </div>

        <aside aria-label="Следующий учебный шаг" className={styles.lessonPreview}>
          <div className={styles.previewHeader}>
            <span>План на сегодня</span>
            <Badge tone="success">5 минут</Badge>
          </div>
          <div className={styles.word}>
            <strong lang="ko">안녕하세요</strong>
            <span>annyeonghaseyo</span>
            <p>Здравствуйте</p>
          </div>
          <div className={styles.nextStep}>
            <span>Первый шаг</span>
            <p>Выберите тему и начните короткое занятие.</p>
          </div>
          <Link className={styles.previewAction} href="/topics">
            Открыть темы <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </header>

      <section aria-labelledby="start-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Начало работы</p>
            <h2 id="start-title">С чего хотите начать?</h2>
          </div>
          <p className={styles.sectionDescription}>
            Выберите один понятный следующий шаг. Между разделами всегда можно переключиться.
          </p>
        </div>
        <div className={styles.grid}>
          {STARTING_POINTS.map((item) => (
            <Link className={styles.routeCard} href={item.href} key={item.href}>
              <div className={styles.cardTop}>
                <span>{item.index}</span>
                <Badge>{item.label}</Badge>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className={styles.cardAction}>
                Открыть <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="rhythm-title" className={styles.rhythm}>
        <div className={styles.rhythmCopy}>
          <p className={styles.kicker}>Ритм обучения</p>
          <h2 id="rhythm-title">Маленький шаг каждый день</h2>
          <p>
            Занимайтесь столько, сколько удобно. Мы сохраним направление и покажем, что повторить
            дальше.
          </p>
          <Link className={styles.textLink} href="/progress">
            Открыть прогресс <span aria-hidden="true">→</span>
          </Link>
        </div>
        <dl className={styles.rhythmStats}>
          <div>
            <dt>Фокус</dt>
            <dd>1 шаг</dd>
          </div>
          <div>
            <dt>Практика</dt>
            <dd>5 минут</dd>
          </div>
          <div>
            <dt>Режим</dt>
            <dd>Свой темп</dd>
          </div>
        </dl>
      </section>
    </PageContainer>
  );
}
