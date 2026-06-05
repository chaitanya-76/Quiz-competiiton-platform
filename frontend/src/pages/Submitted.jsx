import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../backgrounds/Background";
import "remixicon/fonts/remixicon.css";

const Submitted = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleGoHome = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="relative h-screen w-full bg-[#171717] overflow-hidden flex justify-center items-center">
      <div className="absolute inset-0 opacity-40">
        <Background />
      </div>

      <div
        className="relative z-10 w-[90%] max-w-[520px] bg-[#1a1a1a] rounded-[2vh] border-t-[0.8vh] border-[#ff6b35] px-[4vh] py-[6vh] text-center shadow-2xl"
        style={{
          boxShadow:
            "0 20px 40px rgba(255,107,53,0.15), 0 0 60px rgba(255,107,53,0.08)",
        }}
      >
        <div className="mx-auto mb-[3vh] h-[10vh] w-[10vh] rounded-full bg-[#ff6b35]/15 border border-[#ff6b35]/40 flex items-center justify-center">
          <i className="ri-checkbox-circle-fill text-[5vh] text-[#32ce21]" />
        </div>

        <p className="text-[#ff6b35] font-archivo text-[2vh] tracking-widest uppercase mb-[1vh]">
          Submission Complete
        </p>

        <h1 className="font-boldonse text-[4.5vh] leading-tight text-[#fafafa] mb-[2vh]">
          Quiz Submitted
          <span className="block text-[3vh] mt-[1vh] bg-linear-to-b from-[#ffffff] via-[#f5f5f5] to-[#ff6b35] bg-clip-text text-transparent">
            Successfully
          </span>
        </h1>

        <div className="h-[0.3vh] w-full bg-linear-to-r from-transparent via-[#ff6b35] to-transparent mb-[3vh]" />

        {name && (
          <p className="font-archivo text-[#f0f0f0] text-[2.2vh] mb-[1vh]">
            Great job, <span className="text-[#ff6b35] font-semibold">{name}</span>!
          </p>
        )}

        <p className="font-playfair text-[#b0b0b0] text-[2vh] leading-relaxed mb-[5vh]">
          Your answers have been recorded. Please wait for the results to be
          announced by the organizers.
        </p>

        <button
          onClick={handleGoHome}
          className="w-full h-[5.5vh] text-[2.2vh] font-ibm rounded-[0.8vh] cursor-pointer bg-[#ff6b35] text-black hover:bg-[#ff8258] transition-colors font-semibold"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Submitted;
