// components/shared/BrandAssets.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  getBrandAssets,
  updateBrandAssets,
  uploadBrandAsset,
} from "@/service/customer/brandAssets";

/* -------------------- helpers -------------------- */
function CopyBtn({ text, label = "Copy" }) {
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast.success("Copied");
        } catch {
          toast.error("Copy failed");
        }
      }}
      className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

function DownloadBtn({ url }) {
  if (!url) return null;
  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noreferrer"
      className="rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700"
    >
      Download
    </a>
  );
}

function FilePreview({ url }) {
  if (!url) return null;
  const isImage = /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(url);
  if (!isImage) return null;
  return (
    <img
      src={url}
      alt="preview"
      className="h-16 w-16 rounded-md border object-cover"
    />
  );
}

function ListEditor({ label, placeholder, values, onChange, type = "text" }) {
  const add = () => onChange([...(values || []), ""]);
  const remove = (i) => onChange((values || []).filter((_, idx) => idx !== i));
  const set = (i, v) => {
    const next = [...(values || [])];
    next[i] = v;
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <button
          type="button"
          onClick={add}
          className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
        >
          + Add
        </button>
      </div>
      {(values || []).length === 0 && (
        <p className="text-xs text-muted-foreground">None added.</p>
      )}
      {(values || []).map((v, i) => (
        <div key={i} className="flex gap-2">
          <Input
            type={type}
            value={v}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="rounded-md border px-2 text-xs text-red-600 hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- multi-file uploader (drag & drop + description) ---------- */
function MultiFileUploader({ label, folder, files, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  async function uploadFiles(picked) {
    if (!picked.length) return;
    try {
      setUploading(true);
      const added = [];
      for (const f of picked) {
        const res = await uploadBrandAsset(f, folder);
        if (res?.success && res?.url) {
          added.push({ url: res.url, description: "" });
        }
      }
      if (added.length) {
        onChange([...(files || []), ...added]);
        toast.success(`${added.length} file(s) uploaded`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onPick(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    uploadFiles(picked);
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const picked = Array.from(e.dataTransfer?.files || []);
    uploadFiles(picked);
  }

  const remove = (i) => onChange((files || []).filter((_, idx) => idx !== i));
  const setDesc = (i, v) => {
    const next = [...(files || [])];
    next[i] = { ...next[i], description: v };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      {/* Hidden native input — click-to-browse */}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onPick}
      />

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <p className="text-sm font-medium text-slate-700">
          {uploading
            ? "Uploading..."
            : isDragging
            ? "Drop files to upload"
            : "Drag & drop files here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Multiple files supported — any format
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(files || []).map((f, i) => (
          <div key={`${f.url}-${i}`} className="rounded-md border p-2">
            <div className="flex items-center gap-2">
              <FilePreview url={f.url} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs">{f.url.split("/").pop()}</p>
                <div className="mt-1 flex gap-1">
                  <DownloadBtn url={f.url} />
                  <CopyBtn text={f.url} label="Copy URL" />
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <Input
              className="mt-2"
              placeholder="Description (optional)"
              value={f.description || ""}
              onChange={(e) => setDesc(i, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
export default function BrandAssets({ clientId }) {
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const empty = useMemo(
    () => ({
      primaryPhone: "",
      secondaryPhone: "",
      websites: [],
      maidIds: [],
      logos: [],
      products: [],
    }),
    []
  );
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!clientId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getBrandAssets(clientId);
        if (!alive) return;
        setCanEdit(!!res?.canEdit);
        const d = res?.data || {};
        setForm({
          ...empty,
          ...d,
          logos: (d.logos || []).map((x) =>
            typeof x === "string"
              ? { url: x, description: "" }
              : { url: x.url, description: x.description || "" }
          ),
          products: (d.products || []).map((x) =>
            typeof x === "string"
              ? { url: x, description: "" }
              : { url: x.url, description: x.description || "" }
          ),
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load brand info");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [clientId, empty]);

  async function handleSave() {
    try {
      if (form.primaryPhone && !/^\d{10}$/.test(form.primaryPhone)) {
        return toast.error("Primary phone must be exactly 10 digits");
      }
      if (form.secondaryPhone && !/^\d{10}$/.test(form.secondaryPhone)) {
        return toast.error("Secondary phone must be exactly 10 digits");
      }
      setSaving(true);
      const res = await updateBrandAssets(clientId, form);
      if (res?.success) {
        toast.success(res.message || "Saved");
        const d = res.data || {};
        setForm({
          ...empty,
          ...d,
          logos: (d.logos || []).map((x) =>
            typeof x === "string"
              ? { url: x, description: "" }
              : { url: x.url, description: x.description || "" }
          ),
          products: (d.products || []).map((x) =>
            typeof x === "string"
              ? { url: x, description: "" }
              : { url: x.url, description: x.description || "" }
          ),
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-5">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </CardContent>
      </Card>
    );
  }

  /* -------------------------- EDIT MODE -------------------------- */
  if (canEdit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business / Brand Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Primary Phone (10 digits)</p>
              <Input
                inputMode="numeric"
                maxLength={10}
                value={form.primaryPhone || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    primaryPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Secondary Phone (10 digits)</p>
              <Input
                inputMode="numeric"
                maxLength={10}
                value={form.secondaryPhone || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    secondaryPhone: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10),
                  }))
                }
              />
            </div>
          </div>

          <ListEditor
            label="Website URLs"
            placeholder="https://example.com"
            values={form.websites}
            onChange={(v) => setForm((p) => ({ ...p, websites: v }))}
          />

          <ListEditor
            label="Maid IDs (emails)"
            placeholder="someone@example.com"
            type="email"
            values={form.maidIds}
            onChange={(v) => setForm((p) => ({ ...p, maidIds: v }))}
          />

          <MultiFileUploader
            label="Logos (any format)"
            folder="brand-assets/logos"
            files={form.logos}
            onChange={(v) => setForm((p) => ({ ...p, logos: v }))}
          />

          <MultiFileUploader
            label="Products (any format)"
            folder="brand-assets/products"
            files={form.products}
            onChange={(v) => setForm((p) => ({ ...p, products: v }))}
          />

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Brand Info"}
          </button>
        </CardContent>
      </Card>
    );
  }

  /* ------------------------- READ-ONLY MODE ------------------------- */
  const hasAny =
    form.primaryPhone ||
    form.secondaryPhone ||
    form.websites?.length ||
    form.maidIds?.length ||
    form.logos?.length ||
    form.products?.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business / Brand Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {!hasAny && (
          <p className="text-sm text-muted-foreground">
            No brand info added yet.
          </p>
        )}

        {(form.primaryPhone || form.secondaryPhone) && (
          <div className="grid gap-3 md:grid-cols-2">
            {form.primaryPhone && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Primary Phone</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {form.primaryPhone}
                  </span>
                  <CopyBtn text={form.primaryPhone} />
                </div>
              </div>
            )}
            {form.secondaryPhone && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Secondary Phone</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {form.secondaryPhone}
                  </span>
                  <CopyBtn text={form.secondaryPhone} />
                </div>
              </div>
            )}
          </div>
        )}

        {form.websites?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Websites</p>
            {form.websites.map((u, i) => (
              <div
                key={`${u}-${i}`}
                className="flex items-center justify-between gap-2 rounded-md border p-2"
              >
                <a
                  href={u}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm text-blue-600 underline"
                >
                  {u}
                </a>
                <CopyBtn text={u} />
              </div>
            ))}
          </div>
        )}

        {form.maidIds?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Maid IDs</p>
            {form.maidIds.map((e, i) => (
              <div
                key={`${e}-${i}`}
                className="flex items-center justify-between gap-2 rounded-md border p-2"
              >
                <span className="truncate text-sm">{e}</span>
                <CopyBtn text={e} />
              </div>
            ))}
          </div>
        )}

        {form.logos?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Logos</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {form.logos.map((f, i) => (
                <div
                  key={`${f.url}-${i}`}
                  className="flex items-start gap-2 rounded-md border p-2"
                >
                  <FilePreview url={f.url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{f.url.split("/").pop()}</p>
                    {f.description && (
                      <p className="mt-1 text-xs text-slate-600">
                        {f.description}
                      </p>
                    )}
                    <div className="mt-1 flex gap-1">
                      <DownloadBtn url={f.url} />
                      <CopyBtn text={f.url} label="Copy URL" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {form.products?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Products</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {form.products.map((f, i) => (
                <div
                  key={`${f.url}-${i}`}
                  className="flex items-start gap-2 rounded-md border p-2"
                >
                  <FilePreview url={f.url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{f.url.split("/").pop()}</p>
                    {f.description && (
                      <p className="mt-1 text-xs text-slate-600">
                        {f.description}
                      </p>
                    )}
                    <div className="mt-1 flex gap-1">
                      <DownloadBtn url={f.url} />
                      <CopyBtn text={f.url} label="Copy URL" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
