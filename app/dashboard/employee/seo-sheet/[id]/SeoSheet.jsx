"use client";

import CommonForm from "@/components/layout/Form";
import { createKeyWordFormControls } from "@/config/employee";
import { createKeyService, getSeoSheetService } from "@/service/customer/work";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const SeoSheet = ({ clientId }) => {
  const [keywordFormData, setKeywordFormData] = useState({
    website: "",
    keyword: "",
    type: "",
    clientId: clientId || "",
  });
  console.log(keywordFormData)
  const [keywordList, setKeywordList] = useState([]);
  const [keyLoading, setKeyLoading] = useState(true);

  async function createKeywordHandle(e) {
    e.preventDefault();

    try {
      const res = await createKeyService(keywordFormData);
      console.log(res, "res");
      if (res.success) {
        setKeywordFormData({
          website: "",
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

  useEffect(() => {
    if (clientId) {
      fetchKeyHandler();
    }
  }, [clientId]);

  return (
    <div>
      <div className="lg:w-1/3">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keywordList.map((item) => {
                  const latestRanking =
                    item.rankings?.[item.rankings.length - 1];
                  return (
                    <tr key={item._id}>
                      <td className="px-4 py-2 font-medium text-gray-700">
                        {item?.website || "-"}
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-700">
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
                    </tr>
                  );
                })}
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
