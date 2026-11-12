import { formatTime } from "../lib/time";
import {
  DURATION_LIMITS,
  POSITION_LIMITS,
  SPEED_LIMITS,
  type EmdrSettings,
} from "../types";

interface SettingsPanelProps {
  settings: EmdrSettings;
  finished: boolean;
  onChange: (patch: Partial<EmdrSettings>) => void;
  onStart: () => void;
}

interface RangeFieldProps {
  id: string;
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

function RangeField({
  id,
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
}: RangeFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-neutral-300">
          {label}
        </label>
        <output
          htmlFor={id}
          className="font-mono text-sm tabular-nums text-emerald-300"
        >
          {valueLabel}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );
}

export function SettingsPanel({
  settings,
  finished,
  onChange,
  onStart,
}: SettingsPanelProps) {
  return (
    <section
      aria-labelledby="settings-title"
      className="relative z-10 w-full max-w-md px-4"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
        className="space-y-8 rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl shadow-emerald-950/50 backdrop-blur sm:p-8"
      >
        <header className="space-y-2 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-emerald-400/80">
            Bilateral stimulation
          </p>
          <h1 id="settings-title" className="text-2xl font-semibold text-white">
            {finished ? "Сессия завершена" : "EMDR"}
          </h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            {finished
              ? "Можно повторить с теми же настройками."
              : "Зелёный шарик двигается влево-вправо. Настройте скорость и длительность сессии."}
          </p>
        </header>

        <div className="space-y-6">
          <RangeField
            id="speed"
            label="Скорость"
            valueLabel={`${settings.speed} px/с`}
            min={SPEED_LIMITS.min}
            max={SPEED_LIMITS.max}
            step={SPEED_LIMITS.step}
            value={settings.speed}
            onChange={(speed) => onChange({ speed })}
          />
          <RangeField
            id="duration"
            label="Длительность"
            valueLabel={formatTime(settings.duration)}
            min={DURATION_LIMITS.min}
            max={DURATION_LIMITS.max}
            step={DURATION_LIMITS.step}
            value={settings.duration}
            onChange={(duration) => onChange({ duration })}
          />
          <RangeField
            id="position"
            label="Положение по высоте"
            valueLabel={`${settings.verticalPosition}%`}
            min={POSITION_LIMITS.min}
            max={POSITION_LIMITS.max}
            step={POSITION_LIMITS.step}
            value={settings.verticalPosition}
            onChange={(verticalPosition) => onChange({ verticalPosition })}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 active:scale-[0.99]"
        >
          {finished ? "Запустить снова" : "Начать сессию"}
        </button>

        <p className="text-center text-xs text-neutral-500">
          Пробел — старт/пауза, Esc — остановить
        </p>
      </form>
    </section>
  );
}
