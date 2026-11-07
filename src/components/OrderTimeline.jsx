const TRACKING_STEPS = [
  { key: 'Placed', label: 'Order Placed' },
  { key: 'Payment Confirmed', label: 'Payment Confirmed' },
  { key: 'Processing', label: 'Processing' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Delivered', label: 'Delivered' },
];

export function formatShortDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function historyDate(order, status) {
  const entries = Array.isArray(order?.statusHistory) ? order.statusHistory : [];
  const entry = entries.find(item => item.status === status);
  return entry?.changedAt || null;
}

export function buildOrderTimeline(order) {
  if (!order) return [];

  const cancelledDate =
    historyDate(order, 'Cancelled') || order.updatedAt || order.createdAt;

  if (order.status === 'Cancelled') {
    return [
      {
        key: 'Placed',
        label: 'Order Placed',
        done: true,
        current: false,
        date: formatShortDate(historyDate(order, 'Placed') || order.createdAt),
      },
      {
        key: 'Cancelled',
        label: 'Cancelled',
        done: true,
        current: true,
        cancelled: true,
        date: formatShortDate(cancelledDate),
      },
    ];
  }

  const currentIndex = Math.max(
    0,
    TRACKING_STEPS.findIndex(step => step.key === order.status)
  );

  return TRACKING_STEPS.map((step, index) => {
    const done = index <= currentIndex;
    let date = '';

    if (done) {
      const recorded = historyDate(order, step.key);
      date = recorded
        ? formatShortDate(recorded)
        : index === 0
          ? formatShortDate(order.createdAt)
          : 'Completed';
    } else if (step.key === 'Delivered' && order.createdAt) {
      const estimate = new Date(
        new Date(order.createdAt).getTime() + 5 * 86400000
      );
      date = `Est. ${formatShortDate(estimate)}`;
    }

    return {
      key: step.key,
      label: step.label,
      done,
      current: index === currentIndex,
      date,
    };
  });
}

export default function OrderTimeline({ order, variant = 'vertical', className = '' }) {
  const steps = buildOrderTimeline(order);

  if (steps.length === 0) return null;

  if (variant === 'horizontal') {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <div className="flex items-start min-w-[460px] py-1">
          {steps.map((step, index) => (
            <div key={step.key} className="flex-1 flex flex-col items-center relative text-center px-1">
              {index > 0 && (
                <div
                  className={`absolute top-3 h-0.5 ${step.done ? 'bg-[#831843]' : 'bg-gray-200'}`}
                  style={{ left: '-50%', right: '50%' }}
                />
              )}
              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                  step.cancelled
                    ? 'bg-red-500'
                    : step.done
                      ? 'bg-[#831843]'
                      : 'bg-gray-100'
                }`}
              >
                {step.done ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <p className={`mt-2 text-[11px] font-medium leading-tight ${step.current ? 'text-[#831843]' : step.done ? 'text-[#17211D]' : 'text-[#6B756F]'}`}>
                {step.label}
              </p>
              {step.date && (
                <p className="text-[10px] text-[#6B756F] mt-0.5">{step.date}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {steps.map((step, index) => (
        <div key={step.key} className={`flex gap-4 ${index < steps.length - 1 ? 'mb-5' : ''}`}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                step.cancelled ? 'bg-red-500' : step.done ? 'bg-[#831843]' : 'bg-gray-100'
              }`}
            >
              {step.done ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 flex-1 mt-1 ${step.done && steps[index + 1].done ? 'bg-[#831843]' : 'bg-gray-200'}`}
                style={{ minHeight: 24 }}
              />
            )}
          </div>
          <div className="pt-1">
            <p className={`font-medium text-sm ${step.cancelled ? 'text-red-600' : step.done ? 'text-[#17211D]' : 'text-[#6B756F]'}`}>
              {step.label}
            </p>
            {step.date && <p className="text-xs text-[#6B756F] mt-0.5">{step.date}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
