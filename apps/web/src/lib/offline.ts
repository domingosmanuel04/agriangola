const QUEUE_KEY = "agriangola.offline-queue";

export type QueuedMutation = {
  id: string;
  path: string;
  method: "POST" | "PATCH";
  body: unknown;
  label: string;
};

export function enqueue(item: Omit<QueuedMutation, "id">) {
  const q = readQueue();
  q.push({ ...item, id: crypto.randomUUID() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function readQueue(): QueuedMutation[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedMutation[];
  } catch {
    return [];
  }
}

export function writeQueue(q: QueuedMutation[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export async function flushQueue(token: string) {
  const q = readQueue();
  const rest: QueuedMutation[] = [];
  for (const item of q) {
    try {
      const res = await fetch(`/api/v1${item.path}`, {
        method: item.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item.body),
      });
      if (!res.ok) rest.push(item);
    } catch {
      rest.push(item);
    }
  }
  writeQueue(rest);
  return rest.length;
}
