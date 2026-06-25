import { Dispatch, SetStateAction } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownSelectedCheck,
  FILTER_DROPDOWN_ACTIVE_CLASS,
  FILTER_DROPDOWN_IDLE_CLASS,
} from "./filters";

type RequirementInlineDropdownProps<T extends string> = {
  menuKey: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onSelect: (value: T) => void;
  triggerClassName: string;
  openMenuKey: string | null;
  setOpenMenuKey: Dispatch<SetStateAction<string | null>>;
  panelClassName?: string;
};

export const RequirementInlineDropdown = <T extends string>({
  menuKey,
  value,
  options,
  onSelect,
  triggerClassName,
  openMenuKey,
  setOpenMenuKey,
  panelClassName = "w-36",
}: RequirementInlineDropdownProps<T>) => {
  const isOpen = openMenuKey === menuKey;
  const selectedLabel =
    options.find((option) => option.value === value)?.label || value;

  return (
    <div className="relative inline-flex justify-center">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpenMenuKey((prev) => (prev === menuKey ? null : menuKey));
        }}
        className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-3xs transition-all ${triggerClassName}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          className={`absolute left-1/2 top-full z-[160] mt-2 -translate-x-1/2 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/12 ${panelClassName}`}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(option.value);
                  setOpenMenuKey(null);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                  selected
                    ? FILTER_DROPDOWN_ACTIVE_CLASS
                    : FILTER_DROPDOWN_IDLE_CLASS
                }`}
              >
                <span>{option.label}</span>
                {selected && <DropdownSelectedCheck className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
