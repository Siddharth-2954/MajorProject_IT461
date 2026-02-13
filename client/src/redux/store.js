import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "./courseSlice";

const store = configureStore({
  reducer: {
    courses: coursesReducer,
  },
});

export default store;