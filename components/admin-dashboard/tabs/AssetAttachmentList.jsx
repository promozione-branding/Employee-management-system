"use client";

import { Button } from "@/components/ui/button";

const labelByType = {
  image: "Image",
  video: "Video",
  pdf: "PDF",
  docs: "Docs",
  other: "Other",
};

const AssetAttachmentList = ({ attachments, onDelete }) => {
  if (!attachments.length) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
        No attachments added yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {attachments.map((item) => (
        <div
          key={item.id}
          className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_auto]"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <span className="rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                {labelByType[item.type] || "Other"}
              </span>
            </div>
            <p className="text-sm text-slate-600">{item.description || "No description"}</p>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Open link
              </a>
            )}
            {item.fileName && (
              <p className="text-xs text-slate-500">File: {item.fileName}</p>
            )}
          </div>

          <div className="flex items-start md:justify-end">
            <Button
              variant="destructive"
              onClick={() => onDelete(item.id)}
              className="h-8 px-3"
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetAttachmentList;
