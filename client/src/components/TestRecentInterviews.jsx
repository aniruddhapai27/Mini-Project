import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecentInterviews } from "../redux/slices/interviewSlice";

const TestRecentInterviews = () => {
  const dispatch = useDispatch();
  const { recentInterviews, recentLoading, recentError } = useSelector(
    (state) => state.interview
  );

  useEffect(() => {
    console.log("TestComponent: Dispatching getRecentInterviews...");
    dispatch(getRecentInterviews(4));
  }, [dispatch]);

  useEffect(() => {
    console.log("TestComponent: State updated:", {
      recentInterviews,
      recentLoading,
      recentError,
      type: typeof recentInterviews,
      isArray: Array.isArray(recentInterviews),
    });
  }, [recentInterviews, recentLoading, recentError]);

  return (
    <div className="bg-red-500 text-white p-4 m-4 rounded">
      <h3>Test Recent Interviews</h3>
      <p>Loading: {recentLoading ? "Yes" : "No"}</p>
      <p>Error: {recentError || "None"}</p>
      <p>Interviews Count: {recentInterviews?.length || "undefined"}</p>
      <p>Type: {typeof recentInterviews}</p>
      <p>Is Array: {Array.isArray(recentInterviews) ? "Yes" : "No"}</p>
      {recentInterviews && (
        <pre className="text-xs mt-2 bg-black p-2 rounded">
          {JSON.stringify(recentInterviews, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TestRecentInterviews;
