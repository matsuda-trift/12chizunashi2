"use client";

type PermissionState = "granted" | "prompt" | "denied" | "error" | "loading";

type StatusCardProps = {
  location: {
    state: PermissionState;
    message?: string;
    onRequest?: () => void;
  };
  heading: {
    state: PermissionState;
    message?: string;
    onRequest?: () => void;
  };
};

function renderBadge(state: PermissionState) {
  const base = "inline-flex min-w-16 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold";
  switch (state) {
    case "granted":
      return (
        <span className={`${base} bg-neutral-800 text-neutral-200`}>
          許可済み
        </span>
      );
    case "loading":
      return (
        <span className={`${base} bg-neutral-700 text-neutral-200`}>
          取得中…
        </span>
      );
    case "prompt":
      return (
        <span className={`${base} bg-[#ff2d55] text-white`}>
          許可待ち
        </span>
      );
    case "denied":
      return (
        <span className={`${base} bg-[#ff2d55] text-white`}>
          拒否
        </span>
      );
    case "error":
      return (
        <span className={`${base} bg-[#ff2d55] text-white`}>
          エラー
        </span>
      );
    default:
      return null;
  }
}

type StatusRowProps = {
  title: string;
  state: PermissionState;
  message?: string;
  onRequest?: () => void;
};

function StatusRow({ title, state, message, onRequest }: StatusRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
        {renderBadge(state)}
      </div>
      {message ? (
        <p className="text-xs leading-relaxed text-neutral-400">{message}</p>
      ) : null}
      {state !== "granted" && onRequest ? (
        <button
          type="button"
          onClick={onRequest}
          className="inline-flex h-9 items-center justify-center rounded-full border border-[#ff2d55] px-4 text-xs font-semibold text-[#ff2d55] transition-colors hover:bg-[#ff2d55] hover:text-white"
        >
          許可をリクエスト
        </button>
      ) : null}
    </div>
  );
}

export function StatusCard({ location, heading }: StatusCardProps) {
  return (
    <section
      aria-label="センサー許可状況"
      className="flex w-full flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 backdrop-blur"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-300">
        STATUS
      </h2>
      <div className="grid gap-3">
        <StatusRow
          title="位置情報"
          state={location.state}
          message={location.message}
          onRequest={location.onRequest}
        />
        <StatusRow
          title="コンパス"
          state={heading.state}
          message={heading.message}
          onRequest={heading.onRequest}
        />
      </div>
    </section>
  );
}
