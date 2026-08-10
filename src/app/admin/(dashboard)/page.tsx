import Link from "next/link";

import { Card } from "@/components/ui/Card";
import ui from "@/features/admin/components/adminUi.module.css";
import {
  listDictionaryEntriesForAdmin,
  listGrammarTopicsForAdmin,
  listUnitsForAdmin,
} from "@/features/admin/data/adminContentRepository";
import { statusBreakdown } from "@/features/admin/presentation/adminUiHelpers";

export default async function AdminDashboardPage() {
  const [units, grammarTopics, dictionaryEntries] = await Promise.all([
    listUnitsForAdmin(),
    listGrammarTopicsForAdmin(),
    listDictionaryEntriesForAdmin(),
  ]);

  return (
    <div className={ui.page}>
      <h1 className={ui.title}>Дашборд</h1>
      <div className={ui.cards}>
        <Card>
          <h2 className={ui.cardTitle}>Юниты</h2>
          <p className={ui.cardCount}>{units.length}</p>
          <p className={ui.cardMeta}>{statusBreakdown(units)}</p>
          <Link className={ui.cardLink} href="/admin/units">
            Открыть юниты
          </Link>
        </Card>
        <Card>
          <h2 className={ui.cardTitle}>Грамматика</h2>
          <p className={ui.cardCount}>{grammarTopics.length}</p>
          <p className={ui.cardMeta}>{statusBreakdown(grammarTopics)}</p>
          <Link className={ui.cardLink} href="/admin/grammar">
            Открыть грамматику
          </Link>
        </Card>
        <Card>
          <h2 className={ui.cardTitle}>Словарь</h2>
          <p className={ui.cardCount}>{dictionaryEntries.length}</p>
          <p className={ui.cardMeta}>{statusBreakdown(dictionaryEntries)}</p>
          <Link className={ui.cardLink} href="/admin/dictionary">
            Открыть словарь
          </Link>
        </Card>
      </div>
    </div>
  );
}
