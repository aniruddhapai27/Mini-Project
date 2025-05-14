import { useEffect } from "react";
import axios from "axios";

const App = () => {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/services/");
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-9xl text-blue-500">
      MINI PROJECT
      <p className="text-3xl text-gray-900">Deployed with git actions</p>
    </div>
  );
};

export default App;
