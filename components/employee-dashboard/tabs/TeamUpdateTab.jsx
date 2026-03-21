"use client";

import CommonForm from "@/components/layout/Form";
import { teamUpdateFormControl } from "@/config/data";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createTeamUpdateService,
  getAllEmailService,
  getTeamUpdateService,
} from "@/service/team-update";

const TeamUpdateTab = ({ clientId }) => {
  const [emailListLoading, setEmailListLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    updateType: "",
    clientId,
  });
  const [selectedEmail, setSelectedEmail] = useState([]);
  const [teamUpdateList, setTeamUpdateList] = useState([]);
  const [teamUpdateLoading, setTeamUpdateLoading] = useState(true);

  function handleSelectEmail(email) {
    setSelectedEmail((prev) =>
      prev.includes(email)
        ? prev.filter((item) => item !== email)
        : [...prev, email],
    );
  }

  async function handleSubmit(event) {
    try {
      event.preventDefault();

      if (!selectedEmail.length) {
        toast.error("Please select at least one email");
        return;
      }

      setSubmitLoading(true);

      const res = await createTeamUpdateService({
        ...formData,
        recipients: selectedEmail,
      });

      if (res.success) {
        toast.success(res.message || "Team update created successfully");
        setFormData({
          title: "",
          description: "",
          link: "",
          updateType: "",
          clientId: "",
        });
        setSelectedEmail([]);
        fetchTeamUpdate();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setSubmitLoading(false);
    }
  }

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

  async function fetchTeamUpdate() {
    try {
      setTeamUpdateLoading(true);
      const res = await getTeamUpdateService();
      if (res.success) {
        setTeamUpdateList(res.data || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setTeamUpdateLoading(false);
    }
  }

  useEffect(() => {
    fetchEmail();
    fetchTeamUpdate();
  }, []);

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-1/2 space-y-6 md:border-r md:pr-8 border-b md:border-b-0 pb-6 md:pb-0">
        <p className="text-2xl font-semibold text-center">Team Update</p>
        <CommonForm
          formControls={teamUpdateFormControl}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          buttonText={submitLoading ? "Sending..." : "Send Update"}
          isBtnDisabled={submitLoading}
        />

        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Recipients</p>
            <p className="text-xs text-gray-500">
              Selected: {selectedEmail.length}
            </p>
          </div>

          {emailListLoading ? (
            <p className="text-sm text-gray-500">Loading emails...</p>
          ) : emailList.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {emailList.map((item) => {
                const email = item?.email;

                return (
                  <label
                    key={item?._id}
                    className="flex items-center gap-3 rounded-md border p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmail.includes(email)}
                      onChange={() => handleSelectEmail(email)}
                    />
                    <span>{email.split("@")[0]}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No email found</p>
          )}
        </div>
      </div>

      <div className="w-full lg:w-1/2 md:pl-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Sent Updates
        </h2>
        {teamUpdateLoading ? (
          <p className="text-center text-gray-500">Loading updates...</p>
        ) : (
          <div className="space-y-4 h-[70vh] overflow-y-auto pr-4">
            {teamUpdateList.length > 0 ? (
              teamUpdateList.map((update) => (
                <div
                  key={update._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800">
                      {update.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 mb-3">
                    {update.description}
                  </p>
                  {update.link && (
                    <a
                      href={update.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      View Link
                    </a>
                  )}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-700">
                      Recipients ({update.recipients.length}):
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {update.recipients.map((email) => (
                        <span
                          key={email}
                          className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
                        >
                          {email.split("@")?.[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 pt-10">
                <p>No updates have been sent yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamUpdateTab;
