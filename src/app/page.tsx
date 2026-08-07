import { APP_NAME } from "@/constants";
import { Badge, Button, Card, Input, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { ContentSection, PageContainer } from "@/wrappers";

import styles from "./page.module.css";
import { FeedbackPreview } from "./FeedbackPreview";

export default function HomePage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Спокойная практика корейского языка короткими понятными шагами."
        eyebrow={<Badge tone="accent">한국어 · 1급</Badge>}
        title={APP_NAME}
      />

      <ContentSection
        description="Доступные элементы, из которых собираются будущие учебные сценарии."
        eyebrow="UI foundation"
        title="Базовые компоненты"
      >
        <Card className={styles.preview}>
          <div className={styles.group}>
            <h3 className={styles.groupTitle}>Действия</h3>
            <div className={styles.actions}>
              <Button>Начать тренировку</Button>
              <Button variant="secondary">Продолжить позже</Button>
              <Button variant="ghost">Подробнее</Button>
              <Button disabled>Недоступно</Button>
            </div>
          </div>

          <div className={styles.group}>
            <h3 className={styles.groupTitle}>Статусы</h3>
            <div className={styles.badges}>
              <Badge>Черновик</Badge>
              <Badge tone="accent">Новая тема</Badge>
              <Badge tone="success">Верно</Badge>
              <Badge tone="warning">Нужен повтор</Badge>
              <Badge tone="danger">Ошибка</Badge>
            </div>
          </div>

          <div className={styles.fields}>
            <Input
              hint="Введите корейское слово или фразу"
              label="Короткий ответ"
              placeholder="안녕하세요"
              required
            />
            <Input
              defaultValue="안녕하새요"
              errorMessage="Проверьте написание окончания"
              label="Ответ с ошибкой"
            />
            <Textarea
              hint="Можно сохранить трудный пример для повторения"
              label="Заметка"
              placeholder="Что стоит повторить?"
            />
          </div>

          <div className={styles.group}>
            <h3 className={styles.groupTitle}>Обратная связь</h3>
            <FeedbackPreview />
          </div>
        </Card>
      </ContentSection>
    </PageContainer>
  );
}
