import { Coffee, EllipsisVertical } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div>
      {/* first section  */}
      <section className="flex gap-5">
        <div className="border px-4 py-5 rounded-xl">
          <div className="flex flex-col gap-3">
            <p className="font-medium text-lg">Sales Overview</p>
            <div className="border flex justify-around rounded-lg px-2">
              <span className="text-sm">1Y</span>
              <span className="text-sm">1M</span>
              <span className="text-sm">1W</span>
            </div>
          </div>

          <div>
            <p>₹5,90,000</p>

            <span>
              <div className="h-2 w-2 bg-red-500 rounded-full" />
              Sale Today
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
