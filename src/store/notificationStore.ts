import { create } from 'zustand';

interface NotificationLog {
  title: string;
  body: string;
  locale: string;
  time: string;
}

interface NotificationState {
  logs: NotificationLog[];
  addLog: (log: Omit<NotificationLog, 'time'>) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [
        { ...log, time: new Date().toLocaleTimeString() },
        ...state.logs,
      ].slice(0, 5),
    })),
}));
