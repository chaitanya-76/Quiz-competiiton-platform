import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Dashboard = () => {
  const name = localStorage.getItem("name");
  const year = localStorage.getItem("year");
  const navigate = useNavigate();
  const [attempted, setAttempted] = useState(null);

  const tl1 = gsap.timeline();

  const checkQuizStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/quiz/status/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAttempted(response.data.attempted);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    checkQuizStatus();
  }, []);

  useEffect(() => {
    if (attempted === true) {
      navigate("/attempted");
    }
  }, [attempted, navigate]);

  return (
    <div className="h-screen w-full bg-[#171717] flex">
      <button
        onClick={handleLogout}
        className="absolute top-[2vh] right-[2vh] bg-red-600 px-[1.5vh] py-[1vh] rounded-lg h-[5vh] w-[12vh] text-[2.3vh] font-semibold cursor-pointer"
      >
        Logout
      </button>
      <div className="h-full w-1/2 flex justify-center items-center">
        <div className="main-card bg-[#0a0a0a] h-[90vh] w-[70vh] flex flex-col justify-between items-center py-[7vh] px-[7vh] rounded-[3vh]">
          <div>
            <h1 className="text-[5vh] font-boldonse leading-[14vh] text-[#fafafa]">
              Welcome, <br />
              <span className="text-[9vh] bg-linear-to-b from-[#ff8258] via-[#ff5821] to-[#ff4000] bg-clip-text text-transparent">
                {localStorage.getItem("name")}
              </span>
            </h1>
            <div className="h-[0.4vh] w-full bg-gray-600" />
          </div>
          <p className="font-playfair text-[2.5vh] text-[#fafafa] opacity-50">
            We wish you all the very best for this Quiz Competition, may you
            shine and rise in this Quiz and get your name at the top.
          </p>
          {attempted === null ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 border-4 border-[#ff4000] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white">Checking Quiz Status...</p>
            </div>
          ) : (
            <button
              onClick={() => {
                document.documentElement.requestFullscreen();
                navigate("/quiz");
              }}
              className="bg-[#171717] text-white h-[5vh] w-[22vh] text-[2.5vh] hover:bg-[#ff4000] hover:text-black transition-all font-ibm rounded-[1vh] cursor-pointer"
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>
      <div className="h-full w-1/2 flex justify-center items-center">
        <div className="h-[90vh] w-[90vh] flex flex-col gap-[3vh] items-center px-[4vh]">
          <h1 className="instruction text-[3vh] text-[#fafafa] font-boldonse">
            Instructions
          </h1>
          <div className="div-line h-[0.3vh] w-full bg-linear-to-r from-transparent via-[#ff4000] to-transparent"></div>
          <p className="text-center text-[#94a3b8] text-[1.8vh]">
            Please read all instructions carefully before starting the quiz
          </p>
          <div className="div-line h-[0.3vh] w-full bg-linear-to-r from-transparent via-[#ff4000] to-transparent"></div>
          <ul className="content list-disc text-[2.2vh] font-lato text-[#94a3b8] flex flex-col gap-[1.5vh]">
            <li>
              Once the quiz starts, you must remain in fullscreen mode
              throughout the competition. Exiting fullscreen mode intentionally
              or unintentionally will be considered a violation and may lead to
              automatic submission of your quiz.
            </li>

            <li>
              Switching browser tabs, minimizing the window, opening other
              applications, or navigating away from the quiz page is strictly
              prohibited. Such actions are monitored by the system and will be
              recorded as violations.
            </li>

            <li>
              Each participant is allowed a maximum of three violations. Upon
              reaching the violation limit, the quiz will be automatically
              submitted and no further answers can be modified or reviewed.
            </li>

            <li>
              Carefully review each question before selecting your answer. Once
              the quiz is submitted, either manually or automatically, changes
              cannot be made and the submission will be treated as final for
              evaluation purposes.
            </li>

            <li>
              Ensure that you have a stable internet connection and sufficient
              battery backup before starting the quiz. Technical interruptions
              from the participant's side will not be considered valid grounds
              for reattempting the examination.
            </li>

            <li>
              Maintain academic integrity throughout the competition. Any
              attempt to use unfair means, external resources, AI tools,
              communication with others, or unauthorized assistance may result
              in immediate disqualification from the Conquer Mind Quiz
              Competition.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
