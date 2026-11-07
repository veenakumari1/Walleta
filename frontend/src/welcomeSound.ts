type ToneOpts = {
  freq: number;
  start: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
};

function tone(ctx: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = ctx.currentTime + o.start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t0 + o.dur);
  const peak = o.gain ?? 0.1;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.03, o.dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.05);
}

/**
 * Plays the welcome sequence (~2.7s, synced with Splash).
 * onRunning: audio is allowed and the sequence started.
 * onBlocked: browser blocked autoplay (needs a click first).
 * Returns a cleanup function (fades out, then closes).
 */
export function playWelcomeSound(
  name = 'Walleta',
  onBlocked?: () => void,
  onRunning?: () => void,
): () => void {
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) {
    onRunning?.();
    return () => {};
  }

  const ctx: AudioContext = new AC();
  const master = ctx.createGain();
  master.gain.value = 3;
  master.connect(ctx.destination);
  let cancelled = false;
  let started = false;

  const run = () => {
    if (started || cancelled) return;
    started = true;
    onRunning?.();

    tone(ctx, master, { freq: 180, slideTo: 720, start: 0, dur: 0.45, gain: 0.12 });
    tone(ctx, master, { freq: 420, slideTo: 1400, start: 0.4, dur: 0.8, type: 'triangle', gain: 0.04 });
    name.split('').forEach((_, i) =>
      tone(ctx, master, { freq: 880 + i * 70, start: 1.0 + i * 0.05, dur: 0.08, gain: 0.03 }),
    );
    tone(ctx, master, { freq: 1318.5, start: 1.15, dur: 0.6, gain: 0.08 });
    tone(ctx, master, { freq: 1760, start: 1.17, dur: 0.8, gain: 0.05 });
    [523.25, 659.25, 783.99].forEach((f, i) =>
      tone(ctx, master, { freq: f, start: 1.7 + i * 0.04, dur: 0.95, gain: 0.05 }),
    );
  };

  if (ctx.state === 'running') {
    run();
  } else {
    ctx.resume().catch(() => {}); // may stay pending without a user gesture
    setTimeout(() => {
      if (cancelled || started) return;
      if (ctx.state === 'running') {
        run();
      } else {
        onBlocked?.();
      }
    }, 200);
  }

  return () => {
    cancelled = true;
    try {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      master.disconnect();
      ctx.close().catch(() => {});
    }, 200);
  };
}