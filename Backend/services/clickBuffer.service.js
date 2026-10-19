import ClickEvent from '../models/ClickEvent.js';
import Link from '../models/link.js';

const FLUSH_INTERVAL_MS = 3000;
const MAX_BATCH = 500;
const MAX_BUFFER = 20000;

let buffer = [];
let timer = null;
let flushing = false;

export const bufferSize = () => buffer.length;

export function pushClick(event) {
  if (buffer.length >= MAX_BUFFER) buffer.shift(); 
  buffer.push(event);
  if (buffer.length >= MAX_BATCH) void flushNow();
}

export async function flushNow() {
  if (flushing || buffer.length === 0) return;
  flushing = true;
  const batch = buffer;
  buffer = [];

  try {
    await ClickEvent.insertMany(
      batch.map(({ counted, ...doc }) => doc), 
      { ordered: false }
    );
  } catch (err) {
    console.error('Click flush failed, re-queueing batch:', err.message);
    buffer = batch.concat(buffer).slice(-MAX_BUFFER);
    flushing = false;
    return;
  }


  try {
    const incs = new Map();
    for (const e of batch) {
      if (e.isBot || e.counted) continue;
      const id = String(e.linkId);
      incs.set(id, (incs.get(id) || 0) + 1);
    }
    if (incs.size) {
      await Link.bulkWrite(
        [...incs].map(([id, n]) => ({ updateOne: { filter: { _id: id }, update: { $inc: { clickCount: n } } } })),
        { ordered: false }
      );
    }
  } catch (err) {
    console.error('Click counter update failed:', err.message);
  } finally {
    flushing = false;
  }
}

export function startClickFlusher() {
  if (timer) return;
  timer = setInterval(() => void flushNow(), FLUSH_INTERVAL_MS);
  timer.unref?.();
}


export async function drainClicks() {
  if (timer) clearInterval(timer);
  timer = null;
  while (flushing) await new Promise((r) => setTimeout(r, 50));
  await flushNow();
}