import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {SplitText} from 'gsap/SplitText'
import DinoRunner from './components/DinoRunner'
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


export default function App() {
  const [Name, setName] = useState("")
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

  gsap.registerPlugin(SplitText)
  
  let mainSplit = SplitText.create(".para", {
    type: "words"
  })

  const handleRegister = () => {
    // Register logic here
    console.log({ regName, regEnrollment, regYear });
    // Add delay to let flip animation complete before flipping back
    setTimeout(() => {
      setIsRegister(false);
      // Reset form fields
      setRegName("");
      setRegEnrollment("");
      setRegYear("");
    }, 600); // Match CSS transition duration
  };

  const tl1 = gsap.timeline();
  const tl2 = gsap.timeline();
  const tl3 = gsap.timeline();
  const tl4 = gsap.timeline();

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
    tl2.from(".div-3-1", {
      y: 800,
      duration: 0.3,
      opacity: 0,
      ease: "back.out(0.5, 0.8)",
    });
    tl2.from(".div-3-2", {
      x: -800,
      duration: 0.3,
      opacity: 0,
      scaleX: 0.6,
      ease: "back.out(1, 0.8)",
    });
    tl2.from(".div-3-3", {
      x: 800,
      duration: 0.3,
      opacity: 0,
      ease: "back.out(1.1, 0.8)",
    });
    tl2.from(".div-3-4", {
      y: -800,
      duration: 0.3,
      opacity: 0,
      ease: "back.out(1.2, 0.8)",
    });
    tl2.to(".div-3-1, .div-3-2, .div-3-3, .div-3-4", {
      duration: 0.5,
      rotate: 360,
      ease: "back.out(1, 0.7)",
    });
    tl2.to(".div-3-1, .div-3-2, .div-3-3, .div-3-4", {
      delay: -0.5,
      duration: 0.8,
      borderRadius: "50%",
      scale: 0.9,
      ease: "power4.out",
    });
    tl2.to(".div-3-1, .div-3-2, .div-3-3, .div-3-4", {
      duration: 0.5,
      scale: 20,
    });
  });

  useGSAP(()=>{
    gsap.from(mainSplit.words, {
      delay: 7,
      autoAlpha: 0,
      y: 900, 
      stagger: 0.3,
    })
  })

  useGSAP(() => {
    tl4.to(".card-screen", {
      delay: 7,
      opacity: 100,
      zIndex: 4,
      duration: 1,
    });
    tl4.from(".card", {
      opacity: 0,
      duration: 0.8,
    });
  });

  return (

    <>
      <style>{`
        .card-flip {
          perspective: 1000px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s ease-in-out;
          transform-style: preserve-3d;
        }
        .card-inner.is-flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
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
        <div className="div-3-1 bg-[#f2e5fd] h-[20vh] w-[20vh] absolute content-center rounded-lg"></div>
        <div className="div-3-2 bg-[#f2e5fd] h-[20vh] w-[20vh] absolute content-center rounded-lg"></div>
        <div className="div-3-3 bg-[#f2e5fd] h-[20vh] w-[20vh] absolute content-center rounded-lg"></div>
        <div className="div-3-4 bg-[#f2e5fd] h-[20vh] w-[20vh] absolute content-center rounded-lg"></div>
      </div>

      <div className="card-screen h-screen w-full bg-[#f2e5fd] absolute opacity-0 flex justify-center items-center">
        <div className="h-full w-1/2 flex flex-col gap-[6vh] pl-[5vh] pt-[15vh]">
          <h1 className="font-boldonse main-text">
            <span className="text-black text-[6vh]">Welcome to</span><br/>
            <span className="bg-linear-to-b from-black to-purple-700 bg-clip-text text-transparent text-[10vh]">Conqure Mind</span>
          </h1>
          <div className="h-[0.4vh] w-full bg-gray-400"></div>
          <p className="font-babes font-medium opacity-50 text-gray-900 text-[2.5vh] para">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, adipisci magnam earum vitae obcaecati fugit harum veniam dolorem excepturi eum laudantium tempora, tenetur rem neque consequatur magni nisi deserunt sapiente?</p>

        {/* <AnimatedButton /> */}
        </div>
        <div className="h-full w-1/2 flex justify-center items-center">
          <div className="card h-[75%] w-[60%] bg-[#eedaff] rounded-[3vh] border-[#ad50ff] border-[0.5vh] z-2 card-flip">
            <div className={`card-inner ${isRegister ? 'is-flipped' : ''}`}>
              {/* Login Card */}
              <div className="card-front flex flex-col pt-[2vh] px-[5vh]">
                <h1 className="text-center text-[5vh] font-ibm">Login</h1>
                <div className="h-[0.2vh] w-full bg-gray-500 mt-[3vh] mb-[6vh]"></div>
                <div className="flex flex-col gap-[1vh] mb-[3vh]">
                  <h1 className="font-bold text-[2.5vh]">Enrollment Number <span className="text-red-600">*</span></h1>
                  <input className="border-[0.3vh] h-[5vh] text-[2vh] border-gray-500 w-full px-[2vh] rounded-[0.8vh]" type="text" placeholder="eg. 0191AL241065"/>
                </div>
                <div className="flex flex-col gap-[1vh]">
                  <h1 className="font-bold text-[2.5vh]">Password <span className="text-red-600">*</span></h1>
                  <input className="border-[0.3vh] h-[5vh] text-[2vh] border-gray-500 w-full px-[2vh] rounded-[0.8vh]" type="text" placeholder="This will be provided by volunteer"/>
                </div>
                {/* <div className="h-[0.2vh] w-full bg-gray-500 mt-[3vh] mb-[6vh]"></div> */}
                <div className="mt-[5vh]"> 
                  <DinoRunner />
                </div>
                <button className="mt-[6vh] bg-purple-800 mx-[8vh] h-[5vh] text-[3vh] font-ibm text-white rounded-[1vh] cursor-pointer">Start Quiz</button>
                <button onClick={() => setIsRegister(true)} className="mt-[2vh] bg-transparent mx-[8vh] h-[4vh] text-[2vh] font-ibm text-purple-800 rounded-[1vh] cursor-pointer border-[0.2vh] border-purple-800 hover:bg-purple-100 transition-all">Register</button>
              </div>

              {/* Register Card */}
              <div className="card-back flex flex-col pt-[2vh] px-[5vh]">
                <h1 className="text-center text-[5vh] font-ibm">Register</h1>
                <div className="h-[0.2vh] w-full bg-gray-500 mt-[3vh] mb-[4vh]"></div>
                
                {/* Name Field */}
                <div className="flex flex-col gap-[1vh] mb-[2vh]">
                  <h1 className="font-bold text-[2.5vh]">Full Name <span className="text-red-600">*</span></h1>
                  <input 
                    className="border-[0.3vh] h-[5vh] text-[2vh] border-gray-500 w-full px-[2vh] rounded-[0.8vh]" 
                    type="text" 
                    placeholder="Enter your full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>

                {/* Enrollment Number Field */}
                <div className="flex flex-col gap-[1vh] mb-[2vh]">
                  <h1 className="font-bold text-[2.5vh]">Enrollment Number <span className="text-red-600">*</span></h1>
                  <input 
                    className="border-[0.3vh] h-[5vh] text-[2vh] border-gray-500 w-full px-[2vh] rounded-[0.8vh]" 
                    type="text" 
                    placeholder="eg. 0191AL241065"
                    value={regEnrollment}
                    onChange={(e) => setRegEnrollment(e.target.value)}
                  />
                </div>

                {/* Year Dropdown */}
                <div className="flex flex-col gap-[1vh] mb-[5vh]">
                  <h1 className="font-bold text-[2.5vh]">Academic Year <span className="text-red-600">*</span></h1>
                  <select 
                    className="border-[0.3vh] h-[5vh] text-[2vh] border-gray-500 w-full px-[2vh] rounded-[0.8vh] bg-white"
                    value={regYear}
                    onChange={(e) => setRegYear(e.target.value)}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <button 
                  onClick={handleRegister}
                  className="bg-purple-800 mx-[8vh] h-[5vh] text-[3vh] font-ibm text-white rounded-[1vh] cursor-pointer hover:bg-purple-900 transition-all"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
