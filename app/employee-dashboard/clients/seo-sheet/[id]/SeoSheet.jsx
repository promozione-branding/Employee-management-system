"use client";

import CommonForm from "@/components/layout/Form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateRankingFormControls } from "@/config/employee";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";
import {
  createKeyService,
  getSeoSheetService,
  updateRankingService,
} from "@/service/customer/work";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SeoSheet = ({ clientId }) => {
  const [data, setData] = useState(null);
  const [dates, setDates] = useState([]);
  const [keyword, setKeywords] = useState(null);
  const { employee } = useEmployeeStore();
  const [updatekeywordId, setUpdatekeywordId] = useState("");
  const [updateRankingFormData, setUpdateRankingFormData] = useState({
    keywordId: updatekeywordId,
    position: null,
    page: null,
    date: "",
    employeeID: employee?._id,
  });

  const fetchData = async () => {
    const res = await getSeoSheetService(clientId);

    const sheet = res.data;
    const newData = sheet.keywords.filter((i) => i.project?.employeeId?.some(
      (id) => id.toString() === employee?._id?.toString()
    ));

    // console.log( sheet.keywords, employee)
    // 🧠 Extract all unique dates
    let allDates = [];

    sheet.keywords.forEach((kw) => {
      kw.rankings.forEach((r) => {
        const d = new Date(r.date).toDateString();
        if (!allDates.includes(d)) {
          allDates.push(d);
        }
      });
    });

    // sort dates
    allDates.sort((a, b) => new Date(a) - new Date(b));

    setDates(allDates);
    setData(newData);
  };

  async function updateRankingHandler(e) {
    e.preventDefault();

    try {
      const res = await updateRankingService({
        ...updateRankingFormData,
        keywordId: updatekeywordId,
        employeeID: employee?._id,
      });

      if (res.success) {
        toast.success(res.message || "Ranking updated successfully");
        fetchData(); // Refresh table to show new ranking
        setUpdatekeywordId(""); // This will close the controlled dialog
        // Reset form data
        setUpdateRankingFormData({
          keywordId: "",
          position: null,
          page: null,
          date: "",
          employeeID: employee?._id,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Error while updating ranking",
      );
    }
  }

  useEffect(() => {
    fetchData();
  }, [employee]);

  if (!data) return <p>Loading...</p>;
  console.log(data)

  const groupedData = data.reduce((acc, kw) => {
    const projectId = kw.projectId;

    if (!acc[projectId]) {
      acc[projectId] = {
        projectName: kw?.project?.projectName || "Unknown Project",
        keywords: [],
      };
    }

    acc[projectId].keywords.push(kw);

    return acc;
  }, {});

  async function createKeywordHandle(projectId) {
    // console.log({
    //   projectId: projectId,
    //   keyword: keyword,
    //   type: "secondary",
    //   clientId: clientId || "",
    // })

    try {
      const res = await createKeyService({
        projectId: projectId,
        keyword: keyword,
        type: "secondary",
        clientId: clientId || "",
      });
      if (res.success) {
        toast.success("Keyword create success");
        setKeywords("")
        fetchData();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "error while creating the keyword",
      );
    }
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        className="border p-3"
        cellPadding="10"
        style={{ borderCollapse: "collapse" }}
      >
        <thead className="border-b bg-gray-100">
          <tr>
            <th className="border-r px-5">S.No</th>
            {/* <th className="border-r px-5">Project</th> */}
            <th className="border-r px-5">Keyword</th>

            {dates.map((date, i) => (
              <th className="border-r px-5" key={i}>
                {date}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Object.entries(groupedData).map(
            ([projectId, projectData]) => (
              <React.Fragment key={projectId}>
                <tr className="bg-gray-100">
                  <td colSpan={dates.length + 3}
                    className="px-4 py-3 font-bold text-gray-800"
                  >
                    <div className="flex justify-between items-center">
                      {projectData.projectName}

                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="p-1 bg-blue-500 text-white rounded">
                            <Plus size={18} />
                          </button>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Add Your Keyword
                            </DialogTitle>
                          </DialogHeader>

                          <div className="gap-3 mt-4 flex flex-col">
                            <Label className="">
                              Keyword
                            </Label>
                            <Input
                              type="text"
                              onChange={(e) => setKeywords(e.target.value)}
                            />
                          </div>

                          <div>
                            <button className="bg-black text-white rounded p-2 w-full" onClick={() => createKeywordHandle(projectId)}>
                              Add
                            </button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>

                {/* PROJECT KEYWORDS */}
                {projectData.keywords.map((kw, index) => {
                  return (
                    <tr key={kw._id} className="border px-5">
                      <td className="border-r px-2">
                        {index + 1}
                      </td>

                      <Dialog
                        open={updatekeywordId === kw._id}
                        onOpenChange={(open) =>
                          !open && setUpdatekeywordId("")
                        }
                      >
                        <DialogTrigger asChild>
                          <td
                            onClick={() =>
                              setUpdatekeywordId(kw._id)
                            }
                            className={`border-r px-5 py-2 capitalize cursor-pointer ${kw.type === "primary"
                              ? "font-bold text-blue-600"
                              : ""
                              }`}
                          >
                            {kw.keyword}
                          </td>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Update Ranking
                            </DialogTitle>

                            <DialogDescription>
                              {kw.keyword}
                            </DialogDescription>
                          </DialogHeader>

                          <div>
                            <CommonForm
                              formControls={
                                updateRankingFormControls
                              }
                              formData={updateRankingFormData}
                              setFormData={
                                setUpdateRankingFormData
                              }
                              onSubmit={updateRankingHandler}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>

                      {dates.map((date, i) => {
                        const found = kw.rankings.find(
                          (r) =>
                            new Date(r.date).toDateString() ===
                            date
                        );

                        return (
                          <td
                            key={i}
                            className={`px-2 text-center ${found ? "bg-red-100" : ""
                              }`}
                          >
                            {found ? (
                              <>
                                {found.page} Page <br />
                                {found.position} Position
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeoSheet;
