"use client";

import { useEffect, useRef } from "react";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function MyDateRangePicker({
  value,
  onChange,
  open,
  setOpen,
}) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen]);

  return (
    <div ref={wrapperRef} className="relative w-fit">
      <input
        readOnly
        onClick={() => setOpen((prev) => !prev)}
        value={
          value?.startDate && value?.endDate
            ? `${format(value.startDate, "dd MMM yyyy")} - ${format(
                value.endDate,
                "dd MMM yyyy"
              )}`
            : ""
        }
        className="border rounded-md px-4 py-2 bg-white cursor-pointer"
      />

      {open && (
        <div className="absolute right-0 mt-2 z-50 bg-white shadow-lg">
          <DateRangePicker
            ranges={[value]}
            onChange={(item) => onChange(item.selection)}
            months={2}
            direction="horizontal"
            moveRangeOnFirstSelection={false}
          />
        </div>
      )}
    </div>
  );
}