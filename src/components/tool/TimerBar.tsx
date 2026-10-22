import { ZapIcon } from '../Icons';

interface TimerBarProps {
  /** Seconds left in the current time window. */
  remaining: number;
  /** Length of the time window in seconds. */
  period: number;
}

/**
 * The "Active Token" header, countdown badge and tech-style progress bar.
 *
 * The bar drains from right to left as the window elapses and turns red in the
 * final five seconds, matching the source project.
 *
 * @param props Component props.
 * @returns The timer block.
 */
export function TimerBar({ remaining, period }: TimerBarProps) {
  const warning = remaining <= 5;
  const percentage = (remaining / period) * 100;

  return (
    <div className="w-full mb-8 relative">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <ZapIcon className="w-4 h-4 text-brand-neon animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">
            Active Token
          </span>
        </div>

        <div
          id="timer-badge"
          className={`px-3 py-1 rounded flex items-center gap-2 transition-colors duration-500 ${
            warning
              ? 'bg-red-500/10 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
              : 'bg-brand-neon/10 border border-brand-neon/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
          }`}
        >
          <div className="relative flex h-2 w-2">
            <span
              id="timer-ping"
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                warning ? 'bg-red-400' : 'bg-brand-neon'
              }`}
            />
            <span
              id="timer-dot"
              className={`relative inline-flex rounded-full h-2 w-2 ${
                warning ? 'bg-red-400' : 'bg-brand-neon'
              }`}
            />
          </div>
          <span
            id="countdown-text"
            className={`text-xs sm:text-sm font-mono font-bold filter drop-shadow-[0_0_5px_currentColor] ${
              warning ? 'text-red-400' : 'text-brand-neon'
            }`}
          >
            {remaining}s
          </span>
        </div>
      </div>

      {/* Tech Data Buffer Bar */}
      <div className="relative w-full h-5 sm:h-6 bg-[#05080f] rounded-sm border border-brand-border/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/20 to-brand-neon/20 opacity-30" />

        {/* Active Fill */}
        <div
          id="progress-bar"
          className="relative h-full w-full transition-all duration-1000 ease-linear flex justify-end"
          style={{ width: `${percentage}%` }}
        >
          <div
            id="progress-gradient"
            className={`absolute inset-0 transition-colors duration-500 ${
              warning ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-brand-accent to-brand-neon'
            }`}
          />
          {/* Scanning highlight */}
          <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-data-stream" />
          {/* Leading edge glow */}
          <div
            id="progress-edge"
            className={`relative h-full w-1.5 transition-colors duration-500 ${
              warning
                ? 'bg-red-200 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] z-0'
                : 'bg-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
            }`}
          />
        </div>

        {/* Segment Mask (drawn over everything to create gaps) */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#05080f,#05080f_3px,transparent_3px,transparent_12px)] pointer-events-none z-10" />
      </div>

      {/* Tech Accents below bar */}
      <div className="flex justify-between w-full mt-2 px-0.5">
        <span className="text-[9px] text-slate-500 font-mono">SYS.BUFFER.01</span>
        <span className="text-[9px] text-brand-neon/50 font-mono tracking-widest animate-pulse">
          SYNC_OK
        </span>
        <span className="text-[9px] text-slate-500 font-mono">0x1E</span>
      </div>
    </div>
  );
}
