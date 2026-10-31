
"use client";

import { useCallback, useEffect, useState } from "react";
import GridForm from "@/components/layout/GridForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { attachmentFormControl } from "@/config/data";
import { initialAttachmentFormData } from "@/config/initialFormDate";
import {
  createAttachmentServices,
  getClientAttachementServices,
  uploadAssetServices,
} from "@/service/customer/attachment";
import { getAllEmailService } from "@/service/team-update";
import toast from "react-hot-toast";
import BrandAssets from "@/components/shared/BrandAssets";
import {
  Paperclip,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  Presentation,
  ExternalLink,
  CalendarDays,
  Mail,
  Check,
  LoaderCircle,
  ShieldCheck,
  Globe,
  FolderOpen,
  Link2,
  RefreshCw,
} from "lucide-react";

const Attachment = ({ clientId }) => {
  const [attachmentFormData, setAttachmentFormData] = useState(
    initialAttachmentFormData
  );
  const [uploading, setUploading] = useState(false);
  const [attachmentList, setAttachmentList] = useState([]);
  const [attachmentLoading, setAttachmentLoading] = useState(true);
  const [emailList, setEmailList] = useState([]);
  const [emailListLoading, setEmailListLoading] = useState(true);
  const [selectEmail, setSelectEmail] = useState([]);

  const fetchAttachments = useCallback(async () => {
    if (!clientId) {
      setAttachmentList([]);
      setAttachmentLoading(false);
      return;
    }

    try {
      setAttachmentLoading(true);
      const res = await getClientAttachementServices(clientId);

      if (res?.success) {
        setAttachmentList(res.data || []);
      } else {
        setAttachmentList([]);
      }
    } catch (error) {
      console.error("Fetch attachments error:", error);
      toast.error(
        error?.response?.data?.message || "Unable to load attachments"
      );
    } finally {
      setAttachmentLoading(false);
    }
  }, [clientId]);

  const fetchEmail = useCallback(async () => {
    try {
      setEmailListLoading(true);
      const res = await getAllEmailService();

      if (res?.success) {
        setEmailList(res.data || []);
      } else {
        setEmailList([]);
      }
    } catch (error) {
      console.error("Fetch email list error:", error);
      toast.error(
        error?.response?.data?.message || "Unable to load email list"
      );
    } finally {
      setEmailListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttachments();
    fetchEmail();
  }, [fetchAttachments, fetchEmail]);

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await uploadAssetServices(formData);

      if (res?.success) {
        setAttachmentFormData((prev) => ({
          ...prev,
          file: res.url,
        }));
        toast.success("File uploaded successfully");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error?.response?.data?.message || "Upload failed"
      );
    } finally {
      setUploading(false);
      // Allows the same file to be selected again.
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!clientId) {
      toast.error("Client information is missing");
      return;
    }

    try {
      const payload = {
        ...attachmentFormData,
        clientId,
        cc_email: selectEmail,
      };

      const res = await createAttachmentServices(payload);

      if (res?.success) {
        toast.success(res.message || "Attachment created successfully");
        setSelectEmail([]);
        setAttachmentFormData(initialAttachmentFormData);
        await fetchAttachments();
      } else {
        toast.error(res?.message || "Unable to create attachment");
      }
    } catch (error) {
      console.error("Create attachment error:", error);
      toast.error(
        error?.response?.data?.message || "Server error"
      );
    }
  }

  const handleSelectEmail = (email) => {
    if (!email) return;

    setSelectEmail((previous) =>
      previous.includes(email)
        ? previous.filter((value) => value !== email)
        : [...previous, email]
    );
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

    return parsedDate.toLocaleString("en-IN", {
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
    return String(type).charAt(0).toUpperCase() + String(type).slice(1);
  };

  const getAssetIcon = (item) => {
    const type = String(item.assetType || "").toLowerCase();
    const file = String(item.file || item.referenceLink || "").toLowerCase();

    if (type.includes("image") || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(file)) {
      return ImageIcon;
    }

    if (type.includes("video") || /\.(mp4|mov|webm)(\?|$)/i.test(file)) {
      return Video;
    }

    if (/\.(xls|xlsx|csv)(\?|$)/i.test(file)) {
      return FileSpreadsheet;
    }

    if (/\.(ppt|pptx)(\?|$)/i.test(file)) {
      return Presentation;
    }

    return FileText;
  };

  const selectedEmailCount = selectEmail.length;
  const attachmentCount = attachmentList.length;

  return (
    <div className="min-w-0 space-y-6 bg-[#F2F4F9]">
      {/* Brand assets */}
      <section className="overflow-hidden rounded-[22px] border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_18px_rgba(15,27,51,0.04)] sm:p-6">
        <BrandAssets clientId={clientId} />
      </section>

      {/* Page heading */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9EFF9] text-[#0A2E66]">
            <Paperclip size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1B33] sm:text-3xl">
              Client Attachments
            </h1>
            <p className="mt-1 text-sm text-[#68738A]">
              Upload, organize, and share client files and resources.
            </p>
          </div>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-[#E3E7F0] bg-white px-4 py-3">
          <FolderOpen size={19} className="text-[#F27B1E]" />
          <span className="text-sm font-semibold text-[#0F1B33]">
            {attachmentCount} {attachmentCount === 1 ? "attachment" : "attachments"}
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.5fr)]">
        {/* Create attachment */}
        <Card className="overflow-hidden rounded-[22px] border-[#E3E7F0] bg-white shadow-[0_4px_18px_rgba(15,27,51,0.04)]">
          <CardHeader className="border-b border-[#E3E7F0] bg-[#F7F8FC] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1E4] text-[#F27B1E]">
                <UploadCloud size={21} />
              </div>

              <div>
                <CardTitle className="text-lg font-bold text-[#0F1B33]">
                  Create Attachment
                </CardTitle>
                <p className="mt-1 text-sm text-[#68738A]">
                  Add a file or share a resource link.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-5 sm:p-6">
            {/* File upload */}
            <div className="space-y-3">
              <label
                htmlFor="attachment-file"
                className="flex items-center gap-2 text-sm font-bold text-[#0F1B33]"
              >
                <Paperclip size={16} className="text-[#68738A]" />
                Upload file
              </label>

              <label
                htmlFor="attachment-file"
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-7 text-center transition ${
                  uploading
                    ? "cursor-wait border-[#C8D3E5] bg-[#F7F8FC]"
                    : "border-[#D6DDEA] bg-[#F9FAFD] hover:border-[#F27B1E] hover:bg-[#FFF9F4]"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0A2E66] shadow-sm ring-1 ring-[#E3E7F0] transition group-hover:text-[#F27B1E]">
                  {uploading ? (
                    <LoaderCircle size={23} className="animate-spin" />
                  ) : (
                    <UploadCloud size={24} />
                  )}
                </div>

                <p className="mt-3 text-sm font-bold text-[#0F1B33]">
                  {uploading ? "Uploading your file..." : "Choose a file to upload"}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#68738A]">
                  Images, videos, PDFs, Office documents, and text files
                </p>

                <span className="mt-3 rounded-lg bg-[#E9EFF9] px-3 py-1.5 text-xs font-bold text-[#0A2E66]">
                  Browse files
                </span>
              </label>

              <Input
                id="attachment-file"
                type="file"
                accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={onFileChange}
                disabled={uploading}
                className="sr-only"
              />

              {uploading && (
                <div className="flex items-center gap-2 rounded-xl bg-[#E9EFF9] px-3 py-2.5 text-sm text-[#0A2E66]">
                  <LoaderCircle size={16} className="animate-spin" />
                  Please wait while your file uploads.
                </div>
              )}

              {attachmentFormData.file && !uploading && (
                <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#BCE5CC] bg-[#F0FAF4] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#17845A]">
                    <Check size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#17845A]">
                      File uploaded successfully
                    </p>
                    <p className="mt-1 break-all text-xs text-[#47745B]">
                      {attachmentFormData.file}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-[#E3E7F0]" />

            {/* Existing attachment form controls */}
            <div className="[&_label]:font-semibold [&_label]:text-[#34415A] [&_input]:rounded-xl [&_input]:border-[#E0E5EF] [&_textarea]:rounded-xl [&_textarea]:border-[#E0E5EF]">
              <GridForm
                formControls={attachmentFormControl}
                formData={attachmentFormData}
                setFormData={setAttachmentFormData}
                onSubmit={handleSubmit}
                buttonText="Create Attachment"
              />
            </div>

            {/* CC email selection */}
            <div className="space-y-3 border-t border-[#E3E7F0] pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9EFF9] text-[#0A2E66]">
                    <Mail size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0F1B33]">
                      CC recipients
                    </h3>
                    <p className="mt-0.5 text-xs text-[#68738A]">
                      Select people to copy on this attachment.
                    </p>
                  </div>
                </div>

                {selectedEmailCount > 0 && (
                  <span className="shrink-0 rounded-full bg-[#FFF1E4] px-2.5 py-1 text-xs font-bold text-[#C75E0B]">
                    {selectedEmailCount} selected
                  </span>
                )}
              </div>

              {emailListLoading ? (
                <div className="flex items-center gap-2 py-3 text-sm text-[#68738A]">
                  <LoaderCircle size={16} className="animate-spin" />
                  Loading recipients...
                </div>
              ) : emailList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {emailList.map((item) => {
                    const email = item?.email;
                    const selected = selectEmail.includes(email);

                    if (!email) return null;

                    return (
                      <button
                        key={item._id || email}
                        type="button"
                        onClick={() => handleSelectEmail(email)}
                        aria-pressed={selected}
                        title={email}
                        className={`inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          selected
                            ? "border-[#F27B1E] bg-[#FFF1E4] text-[#A84B08]"
                            : "border-[#E0E5EF] bg-white text-[#5B6478] hover:border-[#C8D3E5] hover:bg-[#F7F8FC]"
                        }`}
                      >
                        {selected && <Check size={14} />}
                        <span className="truncate">
                          @{email.split("@")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl bg-[#F7F8FC] px-3 py-4 text-sm text-[#68738A]">
                  No email recipients are available.
                </p>
              )}

              {selectedEmailCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectEmail([])}
                  className="text-xs font-semibold text-[#68738A] transition hover:text-[#CC3B32]"
                >
                  Clear selected recipients
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attachment list */}
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#0F1B33]">
                Attachments
              </h2>
              <p className="mt-1 text-sm text-[#68738A]">
                Files and links shared with this client.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={fetchAttachments}
              disabled={attachmentLoading}
              className="h-10 w-fit gap-2 rounded-xl border-[#E0E5EF] bg-white text-[#0A2E66] hover:bg-[#E9EFF9]"
            >
              <RefreshCw
                size={15}
                className={attachmentLoading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          </div>

          {attachmentLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <Card
                  key={item}
                  className="overflow-hidden rounded-2xl border-[#E3E7F0] bg-white"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 animate-pulse rounded-xl bg-[#E9EFF9]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-[#E3E7F0]" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-[#F2F4F9]" />
                      </div>
                    </div>
                    <div className="h-4 w-full animate-pulse rounded bg-[#F2F4F9]" />
                    <div className="h-16 animate-pulse rounded-xl bg-[#F7F8FC]" />
                    <div className="h-9 w-32 animate-pulse rounded-lg bg-[#E9EFF9]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : attachmentList.length === 0 ? (
            <Card className="rounded-[22px] border border-dashed border-[#CBD5E4] bg-white shadow-none">
              <CardContent className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9EFF9] text-[#0A2E66]">
                  <FolderOpen size={30} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#0F1B33]">
                  No attachments yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#68738A]">
                  Once you create an attachment, its details and access link
                  will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {attachmentList.map((item) => {
                const AssetIcon = getAssetIcon(item);
                const assetLink = getAssetLink(item);
                const isPublic = String(item.visibility || "").toLowerCase() === "public";

                return (
                  <Card
                    key={item._id}
                    className="group min-w-0 overflow-hidden rounded-[20px] border-[#E3E7F0] bg-white shadow-[0_3px_14px_rgba(15,27,51,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#C8D3E5] hover:shadow-[0_8px_24px_rgba(15,27,51,0.07)]"
                  >
                    <CardContent className="p-5">
                      {/* Type and visibility */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9EFF9] text-[#0A2E66] transition group-hover:bg-[#FFF1E4] group-hover:text-[#F27B1E]">
                          <AssetIcon size={23} />
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold ${
                            isPublic
                              ? "bg-[#E5F5EC] text-[#17845A]"
                              : "bg-[#FFF4D9] text-[#946000]"
                          }`}
                        >
                          {isPublic ? (
                            <Globe size={12} />
                          ) : (
                            <ShieldCheck size={12} />
                          )}
                          {item.visibility || "Unspecified"}
                        </span>
                      </div>

                      {/* Attachment details */}
                      <div className="mt-4 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8A92A6]">
                          {getAssetLabel(item.assetType)}
                        </p>

                        <h3 className="mt-1 break-words text-base font-bold leading-6 text-[#0F1B33]">
                          {item.title || "Untitled attachment"}
                        </h3>

                        <p className="mt-2 min-h-[44px] break-words text-sm leading-[22px] text-[#68738A]">
                          {item.description || "No description provided."}
                        </p>
                      </div>

                      {/* Link preview */}
                      {assetLink && (
                        <div className="mt-4 flex min-w-0 items-start gap-2.5 rounded-xl border border-[#E3E7F0] bg-[#F7F8FC] p-3">
                          <Link2
                            size={16}
                            className="mt-0.5 shrink-0 text-[#8A92A6]"
                          />
                          <p className="min-w-0 break-all text-xs leading-5 text-[#5B6478]">
                            {assetLink}
                          </p>
                        </div>
                      )}

                      {/* Date and action */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E3E7F0] pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#8A92A6]">
                          <CalendarDays size={14} />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>

                        {assetLink ? (
                          <a
                            href={assetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0A2E66] px-3 text-xs font-bold text-white transition hover:bg-[#12397A]"
                          >
                            Open attachment
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-xs text-[#8A92A6]">
                            No link available
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Attachment;
