import axiosInstance from "@/service/axiosInstance";

export async function acceptAnnouncementService(id) {
  const { data } = await axiosInstance.put(
    `/api/annoucement/accept/${id}`,
  );
  return data;
}

export async function acknowledAnnouncementService(id) {
  const { data } = await axiosInstance.put(
    `/api/annoucement/acknowledged/${id}`,
  );
  return data;
}

export async function noticationAnnouncementService(quiry) {
  const { data } = await axiosInstance.get(
    `/api/annoucement/get-announcement-designation/${quiry}`,
  );
  return data;
}

export async function getListAnnouncementService(quiry) {
  const { data } = await axiosInstance.get(
    `/api/annoucement/get-annuncement-list/${quiry}`,
  );
  return data;
}


