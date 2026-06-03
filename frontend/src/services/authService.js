import api from "../api/axios";

export const loginUser = async (
  enrollment_no,
  password
) => {

  const response = await api.post(
    "/auth/login/",
    {
      enrollment_no,
      password,
    }
  );

  return response.data;
};