import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Submitted = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, []);

  return (
    <div className="bg-black h-screen w-full text-white flex justify-center items-center flex-col">
      <h1>Quiz Submitted Successfully wait for results</h1>
      <button
        onClick={() => {
          navigate("/");
        }}
        className="bg-white text-black mt-[5vh] p-[1vh]"
      >
        Back to home page
      </button>
    </div>
  );
};

export default Submitted;
