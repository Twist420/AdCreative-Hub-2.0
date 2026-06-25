import type React from "react";
import { CHANNELS } from "../../types";

export const getChannelDisplayName = (channelId: string) => {
  const channel = CHANNELS.find((item) => item.id === channelId);
  return (channel?.name || channelId).replace(/\s*\([^)]*\)/g, "");
};

export const DeliveryChannelsCell: React.FC<{ channels?: string[]; maxVisible?: number }> = ({
  channels = [],
  maxVisible = 2,
}) => {
  const normalizedChannels = channels.length > 0 ? channels : ["all"];
  const labels = normalizedChannels.map(getChannelDisplayName);
  const visibleLabels = labels.slice(0, maxVisible);
  const hiddenCount = labels.length - visibleLabels.length;

  return (
    <div className="group/channel relative mx-auto flex max-w-[180px] items-center justify-center gap-1 overflow-visible">
      <div className="flex max-w-[180px] items-center justify-center gap-1 overflow-hidden">
        {visibleLabels.map((label) => (
          <span
            key={label}
            className="max-w-[72px] truncate rounded-full border border-slate-150 bg-slate-50 px-2.5 py-1 text-[9px] font-black text-slate-500"
          >
            {label}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="rounded-full border border-slate-150 bg-white px-2 py-1 text-[9px] font-black text-slate-400">
            ...
          </span>
        )}
      </div>
      <span className="pointer-events-none absolute left-1/2 top-full z-[120] mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700 shadow-lg group-hover/channel:block">
        {labels.join("、")}
      </span>
    </div>
  );
};
