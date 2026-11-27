import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:8080/api"
    : "/api");

const studyPackApi = axios.create({
  baseURL: `${API_URL.replace(/\/+$/, "")}/study-packs`,
  timeout: 300000,
});

// Automatically attach JWT token
studyPackApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Generate from topic or pasted text
export const generateStudyPack = async (data) => {
  const response = await studyPackApi.post("/generate", data);

  return response.data;
};

// Generate from PDF, DOCX or TXT
export const uploadStudyPack = async ({
  file,
  title,
  difficulty = "Beginner",
  language = "English",
}) => {
  const formData = new FormData();

  formData.append("file", file);

  if (title?.trim()) {
    formData.append("title", title.trim());
  }

  formData.append("difficulty", difficulty);
  formData.append("language", language);

  const response = await studyPackApi.post(
    "/upload",
    formData
  );

  return response.data;
};

// Get all saved Study Packs
export const getMyStudyPacks = async (search = "") => {
  const response = await studyPackApi.get("", {
    params: search.trim()
      ? { search: search.trim() }
      : {},
  });

  return response.data;
};

// Get a single Study Pack
export const getStudyPackById = async (id) => {
  const response = await studyPackApi.get(
    `/${encodeURIComponent(id)}`
  );

  return response.data;
};

// Get Study Pack count
export const getStudyPackCount = async () => {
  const response = await studyPackApi.get("/count");

  return response.data.count;
};

// Rename Study Pack
export const renameStudyPack = async (id, title) => {
  const response = await studyPackApi.patch(
    `/${encodeURIComponent(id)}`,
    { title }
  );

  return response.data;
};

// Delete Study Pack
export const deleteStudyPack = async (id) => {
  await studyPackApi.delete(
    `/${encodeURIComponent(id)}`
  );
};

// Handle API errors
export const getStudyPackError = (error) => {
  const status = error.response?.status;

  if (status === 401 || status === 403) {
    return "Your session may have expired or access was denied. Please log in again.";
  }

  if (status === 400) {
    return "Invalid study material. Please check your input or file.";
  }

  if (status === 404) {
    return "Study Pack not found.";
  }

  if (status === 413) {
    return "File size exceeds the allowed limit.";
  }

  if (status === 415) {
    return "Unsupported file or request format.";
  }

  if (status === 429) {
    return "AI request limit reached. Please try again later.";
  }

  if (status >= 500) {
    return "AI service is temporarily unavailable. Please try again.";
  }

  if (error.code === "ECONNABORTED") {
    return "Generation timed out. Please try again.";
  }

  if (!error.response) {
    return "Unable to connect to the server. Please check your connection.";
  }

  return "Something went wrong. Please try again.";
};