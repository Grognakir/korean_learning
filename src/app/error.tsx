"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#eef3f1" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Ошибка загрузки</h1>
        <p style={{ color: "#3d564b", marginBottom: "1rem" }}>
          {error.message || "Что-то пошло не так при открытии страницы."}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            background: "#0f6b5c",
            color: "white",
            border: "none",
            borderRadius: "999px",
            padding: "0.6rem 1.2rem",
            cursor: "pointer",
          }}
        >
          Попробовать снова
        </button>
      </body>
    </html>
  );
}
