"use client";

import { ITEM_ICONS } from "@/lib/icons";

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="field">
      <label>图标</label>
      <div className="icon-picker">
        {ITEM_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            className={`icon-pick ${value === icon ? "active" : ""}`}
            onClick={() => onChange(icon)}
            aria-label={`选择图标 ${icon}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
