import Link from "next/link";

import { Badge } from "@/components/ui";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

const STARTING_POINTS = [
  {
    description: "Посмотрите доступные направления и выберите первый модуль.",
    href: "/topics",
    label: "Каталог",
    title: "Темы",
  },
  {
    description: "Начните короткую сессию и потренируйте активное вспоминание.",
    href: "/training",
    label: "Практика",
    title: "Тренировка",
  },
  {
    description: "Вернитесь к сложным словам и закрепите их в удобном темпе.",
    href: "/review",
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
        </div>
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
              <Badge>{item.label}</Badge>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className={styles.cardAction}>
                Открыть <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
