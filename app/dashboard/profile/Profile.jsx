"use client";

import { useAdminStore } from "@/lib/store/AdminStore";

const Profile = () => {
  const { adminDetail } = useAdminStore();



  return (
    <div className="p-4 border rounded-lg">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      {adminDetail ? (
        <div>
          <p>
            <strong>Username:</strong> {adminDetail.username}
          </p>
          <p>
            <strong>Email:</strong> {adminDetail.email}
          </p>
          <p>
            <strong>Role:</strong> {adminDetail.role}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
