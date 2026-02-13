import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// For now we use static mock data so the backend
// is not required to run the frontend.
const mockCourses = [
  {
    _id: "1",
    title: "Modern HTML & CSS",
    description: "Learn to build responsive, accessible web pages from scratch.",
    category: "Frontend",
    level: "Beginner",
    duration: "8h",
    thumbnail:
      "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
  },
  {
    _id: "2",
    title: "JavaScript Essentials",
    description: "Master the fundamentals of JavaScript for web development.",
    category: "Frontend",
    level: "Beginner",
    duration: "10h",
    thumbnail:
      "https://images.pexels.com/photos/1181465/pexels-photo-1181465.jpeg",
  },
  {
    _id: "3",
    title: "React for Beginners",
    description: "Build interactive UIs with React and modern tooling.",
    category: "Frontend",
    level: "Intermediate",
    duration: "12h",
    thumbnail:
      "https://images.pexels.com/photos/2706379/pexels-photo-2706379.jpeg",
  },
];

export const fetchAllCourses = createAsyncThunk(
  "courses/fetchAll",
  async () => {
    // In a real app this would call your backend.
    // For now we just simulate an async call.
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCourses), 300);
    });
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load courses";
      });
  },
});

export default courseSlice.reducer;

