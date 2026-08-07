"use client";

import { useState } from "react";

import { Alert, EmptyState } from "@/components/feedback";
import { Button, Modal, ProgressBar, Spinner } from "@/components/ui";

import styles from "./page.module.css";

export function FeedbackPreview() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={styles.feedbackGrid}>
      <div className={styles.feedbackStack}>
        <ProgressBar label="Прогресс демонстрационного урока" showValue value={64} />
        <Alert title="Ответ сохранён" tone="success">
          Следующее упражнение уже готово.
        </Alert>
        <div className={styles.loadingState}>
          <Spinner label="Загружаем пример" size="small" />
          <span>Подбираем следующий пример…</span>
        </div>
        <Button onClick={() => setModalOpen(true)} variant="secondary">
          Открыть диалог
        </Button>
      </div>

      <EmptyState
        action={<Button variant="ghost">Выбрать тему</Button>}
        description="Сохранённые слова появятся после первой тренировки."
        title="Пока нечего повторять"
      />

      <Modal
        description="Фокус остаётся внутри окна и возвращается на кнопку после закрытия."
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="Начать короткую тренировку?"
      >
        <p>Пять заданий займут около трёх минут.</p>
        <Button onClick={() => setModalOpen(false)}>Начать</Button>
      </Modal>
    </div>
  );
}
