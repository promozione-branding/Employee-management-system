"use client";

import GridForm from "@/components/layout/GridForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { attachmentFormControl } from "@/config/data";
import { initialAttachmentFormData } from "@/config/initialFormDate";
import {
  createAttachmentServices,
  getClientAttachementServices,
  uploadAssetServices,
} from "@/service/customer/attachment";
import { getAllEmailService } from "@/service/team-update";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Attachment = ({ clientId }) => {
  const [attachmentFormData, setAttachmentFormData] = useState(
    initialAttachmentFormData,
  );
  const [uploading, setUploading] = useState(false);

  const [attachmentList, setAttachmentList] = useState([]);
  const [attachmentLoading, setAttachmentLoading] = useState(true);

  // cc Mail fetures
  const [emailList, setEmailList] = useState([]);
  const [emailListLoading, setEmailListLoading] = useState(true);
  const [selectEmail, setSelectEmail] = useState([]);

  /* =========================
     FILE UPLOAD
  ========================= */
  async function onFileChange(e) {
    const file = e.target.files[0];

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

        toast.success("File uploaded");
      }
    } catch (error) {
      console.log(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  /* =========================
     FORM SUBMIT
  ========================= */
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const payload = {
        ...attachmentFormData,
        clientId,
        cc_email: selectEmail,
      };

      const res = await createAttachmentServices(payload);
      if (res?.success) {
        toast.success(res.message);
        setSelectEmail([]);
        setAttachmentFormData(initialAttachmentFormData);
        if (clientId) {
          setAttachmentLoading(true);
          const attachmentRes = await getClientAttachementServices(clientId);
          if (attachmentRes?.success) {
            setAttachmentList(attachmentRes.data || []);
          }
          setAttachmentLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Server error");
      setAttachmentLoading(false);
    }
  }

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

  async function fetchEmail() {
    try {
      setEmailListLoading(true);
      const res = await getAllEmailService();
      if (res.success) {
        setEmailList(res.data || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setEmailListLoading(false);
    }
  }

  const handleSelectEmail = (item) => {
    setSelectEmail((prevEmail) => {
      if (prevEmail.includes(item?.email)) {
        return prevEmail.filter((email) => email !== item?.email);
      } else {
        return [...prevEmail, item?.email];
      }
    });
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
    fetchEmail();
    loadAttachments();
  }, [clientId]);

  console.log(attachmentList)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Create Attachment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 mb-4">
            <p className="text-sm font-medium">Upload File</p>

            <Input
              type="file"
              accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              onChange={onFileChange}
            />

            {uploading && <p className="text-sm text-blue-500">Uploading...</p>}

            {attachmentFormData.file && (
              <p className="text-xs text-green-600 break-all">
                Uploaded: {attachmentFormData.file}
              </p>
            )}
          </div>

          <GridForm
            formControls={attachmentFormControl}
            formData={attachmentFormData}
            setFormData={setAttachmentFormData}
            onSubmit={handleSubmit}
            buttonText="Create Attachment"
          />

          {emailListLoading ? (
            "Loading"
          ) : (
            <div className="flex flex-wrap gap-3 mt-3">
              {emailList?.map((item) => (
                <button
                  key={item?._id}
                  onClick={() => handleSelectEmail(item)}
                  className={`p-1 border rounded-lg shadow-sm text-sm font-medium text-gray-700 duration-300 capitalize ${selectEmail.includes(item?.email)
                      ? "bg-blue-50 border-emerald-500 scale-105"
                      : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                >
                  @{item?.email?.split("@")?.[0]}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Attachments</h2>
            <p className="text-sm text-muted-foreground">
              {attachmentList.length} item
              {attachmentList.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {attachmentLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((item) => (
              <Card key={item} className="border-dashed">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="h-6 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
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
          <div className="grid gap-4 md:grid-cols-2">
            {attachmentList.map((item) => (
              <Card key={item._id} className="overflow-hidden">
                <CardContent className="p-5 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {getAssetLabel(item.assetType)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${item.visibility === "public"
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
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.cc_email.length > 0 ? item.cc_email.join(", ") : "No CC emails provided."}
                      </p>
                    </div>

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

export default Attachment;
