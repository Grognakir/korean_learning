import { APP_NAME } from "@/constants";

export default function HomePage() {
  return (
    <main className="page-container page-section flow" id="main-content" tabIndex={-1}>
      <h1>{APP_NAME}</h1>
      <p>Приложение готовится к первому учебному модулю.</p>
    </main>
  );
}
