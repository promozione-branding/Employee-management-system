"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const assetTypeOptions = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "docs", label: "Docs" },
  { value: "other", label: "Other" },
];

const AssetUploadForm = ({ formData, onChange, onFileChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border bg-white p-4">
      <div className="grid gap-2">
        <p className="text-sm font-medium">Asset Type</p>
        <Select value={formData.type} onValueChange={(value) => onChange("type", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select asset type" />
          </SelectTrigger>
          <SelectContent>
            {assetTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium">Title</p>
        <Input
          value={formData.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Enter title"
        />
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium">Description</p>
        <Textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Short description"
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium">Reference Link</p>
        <Input
          type="url"
          value={formData.link}
          onChange={(e) => onChange("link", e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium">Upload File</p>
        <Input
          type="file"
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onChange={onFileChange}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          Add Attachment
        </Button>
      </div>
    </form>
  );
};

export default AssetUploadForm;
