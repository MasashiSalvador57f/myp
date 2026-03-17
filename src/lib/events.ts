/**
 * シンプルなアプリ内イベントバス
 * メモ/タスクの作成・更新・削除を各コンポーネントに通知する
 */

type EventType = "memo:changed" | "task:changed";
type Listener = () => void;

const listeners = new Map<EventType, Set<Listener>>();

export function on(event: EventType, listener: Listener): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(listener);
  return () => listeners.get(event)?.delete(listener);
}

export function emit(event: EventType): void {
  listeners.get(event)?.forEach((fn) => fn());
}
