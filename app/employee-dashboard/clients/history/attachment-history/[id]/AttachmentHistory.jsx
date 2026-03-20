"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getClientAttachementServices } from "@/service/customer/attachment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AttachmentHistory = ({ clientId }) => {
  const [attachmentList, setAttachmentList] = useState([]);
  const [attachmentLoading, setAttachmentLoading] = useState(true);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAssetLink = (item) => item.file || item.referenceLink || "";

  const getAssetLabel = (type) => {
    if (!type) return "Asset";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  useEffect(() => {
    if (!clientId) return;

    async function loadAttachments() {
      try {
        setAttachmentLoading(true);
        const res = await getClientAttachementServices(clientId);
        if (res?.success) {
          setAttachmentList(res.data || []);
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message || "Error while fetching attachment",
        );
      } finally {
        setAttachmentLoading(false);
      }
    }
    loadAttachments();
  }, [clientId]);

  return (
    <div className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Attachment History</h2>
            <p className="text-sm text-muted-foreground">
              {attachmentList.length} item
              {attachmentList.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {attachmentLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="border-dashed">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                    <div className="h-6 w-2/3 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                    <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : attachmentList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-52 flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-lg font-medium">No attachments yet</p>
              <p className="text-sm text-muted-foreground">
                Uploaded files and shared links for this client will appear
                here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attachmentList.map((item) => (
              <Card key={item._id} className="overflow-hidden">
                <CardContent className="p-5 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {getAssetLabel(item.assetType)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.visibility === "public"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.visibility}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {item.title || "Untitled attachment"}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description || "No description provided."}
                      </p>
                    </div>

                    {item?.cc_email?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-slate-500">
                          CC Emails
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.cc_email.map((email, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                            >
                              @{email.split("@")[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-lg border bg-slate-50 p-3 text-sm">
                      <p className="font-medium text-slate-700">
                        {item.file ? "File URL" : "Reference Link"}
                      </p>
                      <p className="mt-1 break-all text-slate-600">
                        {getAssetLink(item)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {getAssetLink(item) && (
                        <a
                          href={getAssetLink(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                          Open Attachment
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentHistory;
