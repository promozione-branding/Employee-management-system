"use client";

import CommonForm from "@/components/layout/Form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createKeyWordFormControls } from "@/config/employee";
import { getCustomerSeoProjectCycleService } from "@/service/customer";
import { createKeyService, deleteKeywordService, getSeoSheetService } from "@/service/customer/work";
import { Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const SeoSheet = ({ clientId }) => {
  const [keywordFormData, setKeywordFormData] = useState({
    projectId: "",
    keyword: "",
    type: "",
    clientId: clientId || "",
  });
  const [projectCycleData, setProjectCycleData] = useState(null);
  const [keywordList, setKeywordList] = useState([]);
  const [keyLoading, setKeyLoading] = useState(true);

  // console.log(keywordList, "res");
  async function createKeywordHandle(e) {
    e.preventDefault();

    try {
      const res = await createKeyService(keywordFormData);
      if (res.success) {
        setKeywordFormData({
          projectId: "",
          keyword: "",
          type: "",
          clientId: clientId || "",
        });
        toast.success("Keyword create success");
        fetchKeyHandler();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "error while creating the keyword",
      );
    }
  }

  async function fetchKeyHandler() {
    setKeyLoading(true);
    try {
      const res = await getSeoSheetService(clientId);
      if (res?.success) {
        setKeywordList(res?.data?.keywords);
        setKeyLoading(false);
      }
    } catch (error) {
      console.log(error);
      setKeyLoading(false);
      toast.error(
        error?.response?.data?.message || "error while fetching keywords",
      );
    }
  }

  async function fetchCustomerProjectCycle() {
    try {
      const response = await getCustomerSeoProjectCycleService(clientId);
      if (response.success) {
        setProjectCycleData(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  async function handleDeleteKeyword(id) {
    const confirmed = window.confirm("Are you sure you want to delete this keyword?");

    if (!confirmed) return;
    try {
      const res = await deleteKeywordService(id);

      if (res.success) {
        toast.success(res.message);
        fetchKeyHandler();
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to delete keyword"
      );
    }
  }

  // console.log(keywordFormData)

  useEffect(() => {
    if (clientId) {
      fetchKeyHandler();
      fetchCustomerProjectCycle()
    }
  }, [clientId]);

  const groupedKeywords = keywordList.reduce((acc, keyword) => {
    const projectId = keyword.projectId;

    if (!acc[projectId]) {
      acc[projectId] = {
        projectName: keyword.project?.projectName || "Unknown Project",
        keywords: [],
      };
    }

    acc[projectId].keywords.push(keyword);

    return acc;
  }, {});

  return (
    <div>
      <div className="lg:w-1/3">
        <div className="mb-2">
          <div className="grid w-full gap-1.5">
            <Label className="mb-1">Project</Label>
          </div>

          <Select
            onValueChange={(value) => setKeywordFormData({
              ...keywordFormData,
              projectId: value,
            })}
            value={keywordFormData.projectId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={"Select Project"} />
            </SelectTrigger>
            <SelectContent>
              {projectCycleData?.map((optionItem) => (
                <SelectItem key={optionItem._id} value={optionItem._id}>
                  {optionItem.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CommonForm
          onSubmit={createKeywordHandle}
          formData={keywordFormData}
          setFormData={setKeywordFormData}
          formControls={createKeyWordFormControls}
          buttonText={"Create keyword"}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Keyword Performance</h2>
        {keyLoading ? (
          <div className="text-center py-4">Loading keywords...</div>
        ) : keywordList.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 font-medium text-gray-900 text-left">
                    Website
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-900 text-left">
                    Keyword
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-900 text-left">
                    Type
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-900 text-center">
                    Current Position
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-900 text-center">
                    Page
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-900 text-right">
                    Last Updated
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-900 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(groupedKeywords).map(([projectId, projectData]) => (
                  <React.Fragment key={projectId}>

                    {/* PROJECT HEADER ROW */}
                    <tr className="bg-gray-100">
                      <td
                        colSpan={7}
                        className="px-4 py-3 font-bold text-gray-800"
                      >
                        {projectData.projectName}
                      </td>
                    </tr>

                    {/* PROJECT KEYWORDS */}
                    {projectData.keywords.map((item) => {
                      const latestRanking =
                        item.rankings?.[item.rankings.length - 1];

                      return (
                        <tr key={item._id}>
                          <td></td>
                          <td className="px-4 py-2 text-gray-700">
                            {item.keyword}
                          </td>

                          <td className="px-4 py-2 text-gray-700 capitalize">
                            {item.type}
                          </td>

                          <td className="px-4 py-2 text-center text-gray-700">
                            {latestRanking?.position || "N/A"}
                          </td>

                          <td className="px-4 py-2 text-center text-gray-700">
                            {latestRanking?.page || "N/A"}
                          </td>

                          <td className="px-4 py-2 text-right text-gray-700">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            <button onClick={() => handleDeleteKeyword(item._id)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            No keywords tracked for this client yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default SeoSheet;
