import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const CORRECT_ID = "260593";
const CORRECT_PW = "395062";

const quizLinks = {
  1: "https://quiz.example.com/year1",
  2: "https://quiz.example.com/year2",
  3: "https://quiz.example.com/year3",
  4: "https://quiz.example.com/year4",
};

const yearLabels = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Fourth Year",
};

export default function App() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!userId.trim()) e.userId = "User ID is required";
    else if (userId !== CORRECT_ID) e.userId = "Invalid User ID";
    if (!password.trim()) e.password = "Password is required";
    else if (password !== CORRECT_PW) e.password = "Incorrect password";
    if (!year) e.year = "Please select your year";
    return e;
  };

  const tl1 = gsap.timeline();
  const tl2 = gsap.timeline();
  const tl3 = gsap.timeline();

  useGSAP(() => {
    tl3.from(".main-head span", {
      y: 20,
      opacity: 0,
      stagger: 0.4,
      duration: 1,
      ease: "back.out(0, 0.8)",
    });
    tl3.to(".main-head", {
      delay: 0.5,
      duration: 1,
      opacity: 0,
      scale: 10,
      ease: "back.in(0.1, 0.7)",
    });
  });

  useGSAP(() => {
    tl1.from(".div-1 div", {
      delay: 2.2,
      y: -800,
      duration: 1,
      opacity: 0,
      stagger: 0.25,
      ease: "elastic.out(0.5, 0.6)",
    });
    tl1.to(".div-1 div", {
      scaleX: 10,
      ease: "slow(0.3, 0.4, false)",
    });
    tl1.to(".div-1 div", {
      scaleY: 1.5,
      ease: "slow(0.3, 0.4, false)",
    });
  });

  useGSAP(() => {
    tl2.from(".div-2 div", {
      delay: 2.2,
      y: 800,
      duration: 1,
      opacity: 0,
      stagger: -0.25,
      ease: "elastic.out(0.5, 0.6)",
    });
    tl2.to(".div-2 div", {
      scaleX: 10,
      ease: "slow(0.3, 0.4, false)",
    });
    tl2.to(".div-2 div", {
      scaleY: 1.5,
      ease: "slow(0.3, 0.4, false)",
    });
    tl2.from(".div-3", {
      y: 800,
      duration: 0.7,
      opacity: 0,
      ease: "back.out(1, 0.6)",
    });
    tl2.to(".div-3", {
      duration: 0.5,
      scale: 10,
      ease: "back.out(1, 0.7)",
    });
    tl2.to(".div-3", {
      duration: 0.5,
      scale: 20,
    });
  });

  useGSAP(()=>{
    gsap.to(".card-screen", {
      delay: 6.5,
      opacity: 100,
      zIndex: 4,
      duration: 1,
    })
  })

  return (
    <>
      <div className="h-screen w-full flex justify-center items-center bg-[#f2e5fd] absolute z-2 overflow-hidden">
        <h1 className="main-head text-center absolute text-[30vh] z-3 font-boldonse ">
          <span className="text-transparent bg-linear-to-b from-black via-black to-purple-700 bg-clip-text">
            CONQUER
          </span>{" "}
          <span className="text-transparent bg-linear-to-b from-black via-black to-purple-900 bg-clip-text">
            MIND
          </span>
        </h1>
        <div className="div-1 h-full w-1/2 flex items-center justify-evenly overflow-hidden">
          <div className="h-[60%] w-[5%] bg-black"></div>
          <div className="h-[60%] w-[5%] bg-black"></div>
          <div className="h-[60%] w-[5%] bg-black"></div>
        </div>
        <div className="div-2 h-full w-1/2 flex items-center justify-evenly overflow-hidden">
          <div className="h-[60%] w-[5%] bg-black"></div>
          <div className="h-[60%] w-[5%] bg-black"></div>
          <div className="h-[60%] w-[5%] bg-black"></div>
        </div>
        <div className="div-3 bg-[#f2e5fd] h-[5%] w-[70%] absolute left-[15%] rounded-lg"></div>
      </div>

      <div className="card-screen h-screen w-full bg-[#f2e5fd] absolute opacity-0 flex justify-center items-center">
        <div className="h-[75%] w-[30%] bg-[#d3a0ff] rounded-[3vh] border-[#ad50ff] border-12 flex flex-col items-center p-[2vh]">
        <div className="h-[75%] w-[30%] bg-[#d3a0ff] rounded-4xl absolute blur-3xl -z-1"></div>
        <h1 className="text-[4vh] text-center font-boldonse bg-linear-to-b from-black to-purple-700 bg-clip-text text-transparent border-b-12 border-black pb-[1vh]">Conquer Mind</h1>
        </div>
      </div>
    </>
  );
}
