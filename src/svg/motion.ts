export type MotionMode = 'none' | 'reveal' | 'step' | 'loop';

export interface MotionConfig {
  mode: MotionMode;
  totalDurationMs?: number;
  stepDurationMs?: number;
  fastDurationMs?: number;
  holdDurationMs?: number;
}

export function getMotionCss(config: MotionConfig): string {
  if (config.mode === 'none') return '';

  const total = config.totalDurationMs ?? 3600;
  const step = config.stepDurationMs ?? 480;
  const fast = config.fastDurationMs ?? 160;
  const hold = config.holdDurationMs ?? 720;

  return `
    :root {
      --motion-fast: ${fast}ms;
      --motion-step: ${step}ms;
      --motion-hold: ${hold}ms;
      --motion-total: ${total}ms;
      --motion-ease: cubic-bezier(.2,.8,.2,1);
    }
    .motion-ready [data-motion-item] {
      opacity: 0.12;
      transform: translateY(8px);
      transition: opacity var(--motion-step) var(--motion-ease),
                  transform var(--motion-step) var(--motion-ease);
    }
    .motion-ready [data-motion-item].is-active {
      opacity: 1;
      transform: translateY(0);
    }
    @media (prefers-reduced-motion: reduce) {
      .motion-ready [data-motion-item] {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
    }
  `;
}

export function getMotionControllerScript(): string {
  return `
    (function() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      document.querySelectorAll('[data-motion-root]').forEach(function(root) {
        var mode = root.getAttribute('data-motion-mode');
        if (!mode || mode === 'none') return;
        var items = root.querySelectorAll('[data-motion-item]');
        if (!items.length) return;
        root.classList.add('motion-ready');
        
        if (mode === 'reveal') {
          items.forEach(function(item, idx) {
            var step = parseInt(item.getAttribute('data-step') || idx, 10);
            setTimeout(function() {
              item.classList.add('is-active');
            }, step * 480);
          });
        }
      });
    })();
  `;
}
