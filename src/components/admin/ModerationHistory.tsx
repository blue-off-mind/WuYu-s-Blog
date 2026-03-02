import { useStore } from "@/contexts/StoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldAlert } from "lucide-react";

interface ModerationHistoryProps {
  articleId: string;
}

export function ModerationHistory({ articleId }: ModerationHistoryProps) {
  const { getModerationLogsByArticle } = useStore();
  const { t } = useLanguage();
  const logs = getModerationLogsByArticle(articleId);

  return (
    <div className="mt-12 pt-8 border-t border-border/50 bg-red-50/10 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4 text-destructive">
        <ShieldAlert className="w-5 h-5" />
        <h3 className="font-serif text-xl font-bold">{t.admin.moderationLog.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t.admin.moderationLog.subtitle}</p>

      <div className="border rounded-md overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t.admin.moderationLog.action}</TableHead>
              <TableHead>{t.admin.moderationLog.content}</TableHead>
              <TableHead className="w-[120px]">{t.admin.moderationLog.moderator}</TableHead>
              <TableHead className="w-[150px] text-right">{t.admin.moderationLog.time}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-bold text-xs uppercase tracking-widest text-destructive">
                  {log.action.replace('_', ' ')}
                </TableCell>
                <TableCell className="text-sm font-serif text-muted-foreground italic">
                  "{log.targetContent}"
                </TableCell>
                <TableCell className="text-xs">{log.moderator}</TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                  {t.admin.moderationLog.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
