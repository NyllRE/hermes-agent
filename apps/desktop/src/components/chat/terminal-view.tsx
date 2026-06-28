'use client'

import type { FC } from 'react'

import { AnsiText } from '@/components/assistant-ui/ansi-text'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

interface TerminalViewProps {
  /** The raw command or code that was executed ($/>>> header). */
  command?: string
  /** stdout output from the tool result. */
  stdout?: string
  /** stderr output from the tool result. */
  stderr?: string
  /** Merged output (used instead of split stdout/stderr when the backend
   *  returns a single stream). */
  output?: string
  /** Process exit code. Undefined while still running. */
  exitCode?: number
  /** Full raw text for the Copy button inside the terminal box. */
  copyText: string
  /** 'terminal' → `$` prefix; 'execute_code' → `>>>` prefix. */
  toolName: 'terminal' | 'execute_code'
}

/**
 * Terminal-style renderer for shell / code-execution tool results.
 *
 * Shows the command as a dimmed prompt header, then stdout and stderr as
 * separate labeled blocks inside a dark, monospace, scrollable terminal
 * box. A Copy button sits at the top-right for the full raw output, and
 * an exit-code footer color-codes success vs failure.
 */
export const TerminalView: FC<TerminalViewProps> = ({
  command,
  copyText,
  exitCode,
  output,
  stderr,
  stdout,
  toolName
}) => {
  const prompt = toolName === 'execute_code' ? '>>>' : '$'
  const hasOutput = Boolean(stdout || stderr || output)
  const exitOk = exitCode === 0 || exitCode === undefined

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-[0.3125rem] border border-(--ui-stroke-tertiary)">
      {/* Command header with prompt */}
      {command && (
        <div className="flex items-start gap-2 border-b border-(--ui-stroke-tertiary) bg-(--ui-chat-surface-background) px-3 py-2 font-mono text-[0.7rem] leading-relaxed text-(--ui-text-primary)">
          <span className="shrink-0 select-none font-semibold text-(--ui-text-tertiary)">{prompt}</span>
          <code className="min-w-0 break-all whitespace-pre-wrap">{command}</code>
        </div>
      )}

      {/* Output area with terminal styling */}
      {hasOutput && (
        <div className="relative bg-black/5 dark:bg-white/5">
          {copyText && (
            <CopyButton
              appearance="inline"
              className="absolute right-1 top-1 z-10 h-5 gap-0 rounded-md px-1 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              iconClassName="size-3"
              showLabel={false}
              stopPropagation
              text={copyText}
            />
          )}
          <div className="max-h-[40dvh] overflow-auto overscroll-contain px-3 py-2 font-mono text-[0.7rem] leading-relaxed">
            <pre className="m-0 min-w-0 break-all whitespace-pre-wrap text-(--ui-text-secondary)">
              {output ? (
                <AnsiText text={output} />
              ) : (
                <>
                  {stdout && <AnsiText text={stdout} />}
                  {stderr && (
                    <>
                      {stdout ? '\n' : ''}
                      <span className="text-(--ui-text-tertiary)">
                        <AnsiText text={stderr} />
                      </span>
                    </>
                  )}
                </>
              )}
            </pre>
          </div>
        </div>
      )}

      {/* No output fallback — only when there's no command either (empty result) */}
      {!hasOutput && !command && (
        <div className="bg-(--ui-chat-surface-background) px-3 py-2 text-center font-mono text-[0.7rem] italic text-(--ui-text-tertiary)">
          No output
        </div>
      )}

      {/* Exit code footer */}
      {exitCode !== undefined && (
        <div
          className={cn(
            'border-t border-(--ui-stroke-tertiary) bg-(--ui-chat-surface-background) px-3 py-1 font-mono text-[0.625rem]',
            !exitOk && 'text-destructive'
          )}
        >
          {exitOk ? (
            <span className="text-emerald-600/85 dark:text-emerald-400/85">
              Exit code: {exitCode}
            </span>
          ) : (
            <span>
              Exit code: {exitCode} (error)
            </span>
          )}
        </div>
      )}
    </div>
  )
}
