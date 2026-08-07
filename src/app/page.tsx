import Link from "next/link";

import { PageHeader } from "@/components/layout";
import { Badge, Card, ProgressBar } from "@/components/ui";
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
      <PageHeader
        actions={
          <Link className={styles.primaryAction} href="/topics">
            Выбрать тему
          </Link>
        }
        description="Короткие занятия, понятный прогресс и спокойное повторение без перегрузки."
        eyebrow={<Badge tone="accent">한국어 · 1급</Badge>}
        title="Корейский язык — шаг за шагом"
      />

      <section aria-labelledby="start-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Начало работы</p>
          <h2 id="start-title">С чего хотите начать?</h2>
        </div>
        <div className={styles.grid}>
          {STARTING_POINTS.map((item) => (
            <Card className={styles.routeCard} key={item.href}>
              <Badge>{item.label}</Badge>
              <h3>
                <Link href={item.href}>{item.title}</Link>
              </h3>
              <p>{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className={styles.progressCard}>
        <div className={styles.progressCopy}>
          <Badge tone="success">Основа готова</Badge>
          <div>
            <h2>Карта приложения собрана</h2>
            <p>Все разделы уже доступны для перехода и готовы к наполнению учебными данными.</p>
          </div>
        </div>
        <ProgressBar label="Готовность каркаса первой контрольной точки" showValue value={92} />
        <Link className={styles.textLink} href="/progress">
          Открыть прогресс
        </Link>
      </Card>
    </PageContainer>
  );
}
