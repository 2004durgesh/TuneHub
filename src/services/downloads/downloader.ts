import { Directory, File, Paths } from 'expo-file-system';

const DIR = new Directory(Paths.document, 'downloads');
const MAX_CONCURRENT = 2;

const songFile = (songId: string) => new File(DIR, `${songId}.m4a`);
const partFile = (songId: string) => new File(DIR, `${songId}.part`);

export type DownloadHandlers = {
  onStart: () => void;
  onProgress: (fraction: number) => void;
  onComplete: (bytes: number) => void;
  onError: (message: string) => void;
};

type Job = { songId: string; url: string; handlers: DownloadHandlers };

const waiting: Job[] = [];
const active = new Map<string, AbortController>();

function deleteIfExists(file: File) {
  if (file.exists) file.delete();
}

export function localSongUri(songId: string): string | null {
  const file = songFile(songId);
  return file.exists ? file.uri : null;
}

export function enqueueDownload(songId: string, url: string, handlers: DownloadHandlers): void {
  if (waiting.some((job) => job.songId === songId)) return;
  if (active.get(songId)?.signal.aborted === false) return;
  waiting.push({ songId, url, handlers });
  pump();
}

// A job waits while a cancelled transfer of the same song is still unwinding: both share its .part file.
function pump() {
  for (let i = 0; i < waiting.length && active.size < MAX_CONCURRENT;) {
    if (active.has(waiting[i].songId)) {
      i++;
      continue;
    }
    void run(waiting.splice(i, 1)[0]);
  }
}

async function run({ songId, url, handlers }: Job) {
  const controller = new AbortController();
  active.set(songId, controller);
  handlers.onStart();
  const part = partFile(songId);
  try {
    if (!DIR.exists) DIR.create({ intermediates: true });
    deleteIfExists(part);
    await File.createDownloadTask(url, part, {
      signal: controller.signal,
      onProgress: ({ bytesWritten, totalBytes }) => {
        if (totalBytes > 0) handlers.onProgress(bytesWritten / totalBytes);
      },
    }).downloadAsync();
    if (controller.signal.aborted) throw new Error('Cancelled');
    const file = songFile(songId);
    deleteIfExists(file);
    part.moveSync(file);
    handlers.onComplete(file.size);
  } catch (error) {
    deleteIfExists(part);
    if (!controller.signal.aborted) {
      handlers.onError(error instanceof Error ? error.message : 'Download failed');
    }
  } finally {
    active.delete(songId);
    pump();
  }
}

export function cancelDownload(songId: string): void {
  const index = waiting.findIndex((job) => job.songId === songId);
  if (index >= 0) waiting.splice(index, 1);
  active.get(songId)?.abort();
}

export function deleteSongFile(songId: string): void {
  cancelDownload(songId);
  deleteIfExists(songFile(songId));
}

export function deleteAllSongFiles(): void {
  waiting.length = 0;
  active.forEach((controller) => controller.abort());
  if (DIR.exists) DIR.delete();
}
