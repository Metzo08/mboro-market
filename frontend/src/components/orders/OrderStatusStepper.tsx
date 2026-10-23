import { Check } from 'lucide-react';
import { DELIVERY_STEPS, orderStatusMeta } from '@/lib/status';
import { cn } from '@/lib/utils';

export function OrderStatusStepper({ status }: { status: string }) {
  const meta = orderStatusMeta(status);
  const cancelled = status === 'CANCELLED' || status === 'REFUNDED';

  if (cancelled) {
    return (
      <div className="rounded-md bg-danger/10 px-3 py-2 text-small font-medium text-danger">
        Commande {meta.label.toLowerCase()}
      </div>
    );
  }

  return (
    <ol className="flex items-center gap-1" aria-label={`Statut : ${meta.label}`}>
      {DELIVERY_STEPS.map((step, index) => {
        const done = meta.step > index;
        const current = meta.step === index + 1;
        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-1 text-center">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                done ? 'bg-success text-white' : current ? 'bg-terracotta text-white' : 'bg-sand text-muted',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <span className={cn('text-[10px] leading-tight', current ? 'font-semibold text-ink' : 'text-muted')}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
