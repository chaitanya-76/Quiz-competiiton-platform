import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import DinoRunner from "../components/DinoRunner";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Background from "../backgrounds/Background";
// import AnimatedButton from "./components/AnimatedButton";

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

export default function Login() {
  const [Name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEnrollment, setRegEnrollment] = useState("");
  const [regYear, setRegYear] = useState("");

  const validate = () => {
    const e = {};
    if (!userId.trim()) e.userId = "User ID is required";
    else if (userId !== CORRECT_ID) e.userId = "Invalid User ID";
    if (!password.trim()) e.password = "Password is required";
    else if (password !== CORRECT_PW) e.password = "Incorrect password";
    if (!year) e.year = "Please select your year";
    return e;
  };

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await loginUser(userId.trim().toUpperCase(), password);

      localStorage.setItem("token", data.access);
      localStorage.setItem("year", data.year);
      localStorage.setItem("name", data.name);
      localStorage.setItem("is_admin_user", data.is_admin_user);

      if (data.is_admin_user) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
      console.log(data);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Invalid credentials. Check enrollment number and password.";
      alert(message);
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from(".main-head h2", {
      y: 30,
      opacity: 0,
      stagger: 0.2,
      duration: 0.6,
      ease: "ease-out",
    });
    
    tl.to(".main-head", {
      delay: 1.2,
      duration: 0.8,
      opacity: 0,
      scale: 2,
      ease: "ease-in",
    });
    
    tl.to(".card-screen", {
      delay: 0.5,
      opacity: 100,
      zIndex: 4,
      duration: 0.8,
    }, "-=0.6");
    
    tl.to(".anim-back", {
      opacity: 1,
      duration: 0.8,
    }, "-=0.8");
    
    tl.from(".main-text", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "ease-out",
    }, "-=0.4");
    
    tl.from(".div-line", {
      width: 0,
      opacity: 0,
      duration: 0.6,
      ease: "ease-out",
    }, "-=0.4");
    
    tl.from(".muted-text", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "ease-out",
    }, "-=0.5");
    
    tl.from(".card", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "ease-out",
    }, "-=0.4");
  });

  return (
    <>
      <div className="h-screen w-full flex justify-center items-center bg-[#171717] absolute z-2 overflow-hidden">
        <h1 className="main-head text-center absolute text-[30vh] z-3 font-boldonse ">
          <h2 className="text-transparent bg-linear-to-b from-[#ffffff] via-[#f5f5f5] to-[#ff6b35] bg-clip-text drop-shadow-lg">
            CONQUER
          </h2>{" "}
          <h2 className="text-transparent bg-linear-to-b from-[#ffffff] via-[#f5f5f5] to-[#ff6b35] bg-clip-text drop-shadow-lg">
            MIND
          </h2>
        </h1>
      </div>

      <div className="card-screen h-screen w-full bg-[#171717] absolute opacity-0 flex justify-center items-center">
        <div className="anim-back opacity-0 absolute inset-0 z-0">
          <Background />
        </div>
        <div className="h-full w-1/2 flex flex-col gap-[6vh] pl-[5vh] pt-[20vh] relative z-10">
          <h1 className="font-boldonse main-text">
            <span className="text-[#f5f5f5] text-[7vh] drop-shadow-lg">
              Welcome to
            </span>
            <br />
            <span className="bg-linear-to-b from-[#ffffff] via-[#fafafa] to-[#ff6b35] bg-clip-text text-transparent text-[11vh]">
              Conqure Mind
            </span>
          </h1>
          <div className="h-[0.5vh] w-[100vh] bg-linear-to-r from-transparent via-[#ff6b35] to-transparent mb-[5vh] div-line shadow-lg"></div>
          <p className="font-playfair font-medium opacity-70 text-[#e0e0e0] text-[2.3vh] muted-text">
            <p className="text-[2.5vh] font-archivo opacity-85 text-[#f0f0f0]\">
              Ready to prove your Coding and Technical knowledge?{" "}
            </p>
            <br />
            Take on challenging questions, compete with fellow developers, and
            rise to the top of the leaderboard. Every answer counts. Every
            second matters. Showcase you skills, knowledge and thinking ability
            and get the spotlight on you.
          </p>
        </div>
        <div className="h-full w-1/2 flex justify-center items-center relative z-10">
          <div
            className="card h-[75%] w-[60%] bg-[#1a1a1a] rounded-[3vh] shadow-2xl shadow-[rgba(255,107,53,0.3)] border-[#ff6b35] border-t-[1.2vh] z-2 card-flip"
            style={{
              boxShadow:
                "0 20px 40px rgba(255,107,53,0.2), 0 0 60px rgba(255,107,53,0.1)",
            }}
          >
            <div className={`card-inner ${isRegister ? "is-flipped" : ""}`}>
              {/* Login Card */}
              <div className="card-front flex flex-col pt-[2vh] px-[5vh]">
                <h1 className="text-center text-[#ffffff] text-[5vh] font-archivo drop-shadow-md">
                  Login
                </h1>
                <div className="h-[0.3vh] w-full bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent mt-[3vh] mb-[6vh]"></div>
                <div className="flex flex-col gap-[1vh] mb-[3vh]">
                  <h1 className="font-bold text-[#f0f0f0] text-[2.5vh]">
                    Enrollment Number <span className="text-[#ff6b35]">*</span>
                  </h1>
                  <input
                    className="border-[0.3vh] h-[5vh] text-[2vh] text-[#ffffff] placeholder-[#888888] bg-[#2a2a2a] border-[#ff6b35] border-opacity-40 w-full px-[2vh] rounded-[0.8vh] focus:outline-none focus:border-[#ff6b35] focus:border-opacity-100 focus:shadow-lg focus:shadow-[rgba(255,107,53,0.3)] transition-all"
                    type="text"
                    placeholder="eg. 0191AL241065"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.toUpperCase())}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
                <div className="flex flex-col gap-[1vh]">
                  <h1 className="font-bold text-[#f0f0f0] text-[2.5vh]">
                    Password <span className="text-[#ff6b35]">*</span>
                  </h1>
                  <input
                    className="border-[0.3vh] h-[5vh] text-[2vh] text-[#ffffff] placeholder-[#888888] bg-[#2a2a2a] border-[#ff6b35] border-opacity-40 w-full px-[2vh] rounded-[0.8vh] focus:outline-none focus:border-[#ff6b35] focus:border-opacity-100 focus:shadow-lg focus:shadow-[rgba(255,107,53,0.3)] transition-all"
                    type="password"
                    placeholder="Password will be shared by volunteers"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleLogin}
                  className="mt-[18vh] mx-[8vh] h-[5vh] text-[3vh] font-ibm rounded-[0.7vh] cursor-pointer start-button"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="anim-back">
          <Background />
        </div>
      </div>
    </>
  );
}
