import React, { useEffect, useRef, useState } from 'react'

export default function Clock() {
    const[breaklength, setBreakLength] = useState(5);
    const[sessionLength, setSessionLength] = useState(25);
    //easier to deal time in seconds
    const[timeLeft, setTimeLeft] = useState(25 * 60);
    const[isTimerRunning, setIsTimerRunning] = useState(false);
    const[timerlabel, setTimerLabel] = useState("Session");

    //creating reference to audio element
    const audioRef = useRef(null);
    //interRef is used to store the interval id so that we can clear it later
    const intervalRef = useRef(null);

    const handleLengthsClick = (actionType, incrementOrDecrement)=>{
        console.log("button clicked: "+actionType+" "+incrementOrDecrement);
        //if timer is running, do not change lengths
        if(isTimerRunning) {
            return;
        }

        if(actionType === "breakLength") {
            const newBreaklength = breaklength + incrementOrDecrement;
            if(newBreaklength > 0  && newBreaklength <= 60){
                setBreakLength(newBreaklength);
            }
            console.log(newBreaklength);
        }

        if(actionType === "sessionLength") {
            const newSessionLength = sessionLength + incrementOrDecrement;
            if((newSessionLength > 0 && newSessionLength <= 60)){
                setSessionLength(newSessionLength);
                //when session length changes, time left should also change
                //convert to seconds because timer are set in minutes originally
                setTimeLeft(newSessionLength*60);
                console.log(newSessionLength);
            }
        }
    }

    const formatTime = (timeInSeconds) => {
        //necessary to convert to string because we need to add leading zeros if the string is less than 2 char using padStart
        const minutes = String(Math.floor(timeInSeconds / 60)).padStart(2,"0");
        const seconds = String(timeInSeconds%60).padStart(2,"0");
        const formatedTime = minutes+ ":"+seconds;
        return formatedTime;
    }

    const handleResetClick = ()=>{
        setIsTimerRunning(false);
        setBreakLength(5);
        setSessionLength(25);
        setTimeLeft(25*60);
        setTimerLabel("Session");

        //stop audio
        audioRef.current.pause();
        // rewind to start
        audioRef.current.currentTime = 0;
    }

    const handleStartStop = ()=>{
        setIsTimerRunning(!isTimerRunning);
    }

    useEffect(()=>{
        //if timer is running, start the interval
        if(isTimerRunning){
            intervalRef.current = setInterval(() => {
                setTimeLeft((prevTime)=>{
                    if(prevTime > 0){
                        return prevTime - 1;
                    }
                    //if time left is 0, switch between session and break
                    //play the audio
                    audioRef.current.play();
                    // switch session to break and vice versa
                    if(timerlabel === "Session"){
                        setTimerLabel("Break");
                        return breaklength * 60;
                    }else if (timerlabel === "Break"){
                        setTimerLabel("Session");
                        return sessionLength * 60;
                    }
                });
            }, 1000);
        }else{
            //if timer is not running, clear the interval
            clearInterval(intervalRef.current);
        }
        //cleanup function to clear the interval when component unmounts or when isTimerRunning changes
        return()=>{
            clearInterval(intervalRef.current);
        }
    },[isTimerRunning, breaklength, sessionLength, timerlabel]);
  return (
    <div className='container'>
        <h1>25 + 5 Clock</h1>
        <div className="length-controls row my-3" style={{maxWidth: "550px", margin: "0 auto"}}>
            <div id="break-label" className="length-control col-6">
                <h2>Break Length</h2>
                <button className='btn btn-info btn-sm mx-2 fw-bold fs-5' id="break-decrement" onClick={()=>{handleLengthsClick("breakLength",-1)}}>-</button>
                <span id="break-length">{breaklength}</span>
                <button className='btn btn-info btn-sm mx-2 fw-bold fs-5' id="break-increment" onClick={()=>{handleLengthsClick("breakLength",1)}}>+</button>
            </div>
            <div id="session-label" className="length-control col-6">
                <h2>Session Length</h2>
                <button className='btn btn-info btn-sm mx-2 fw-bold fs-5' id="session-decrement" onClick={()=>{handleLengthsClick("sessionLength",-1)}}>-</button>
                <span id="session-length">{sessionLength}</span>
                <button className='btn btn-info btn-sm mx-2 fw-bold fs-5' id="session-increment" onClick={()=>{handleLengthsClick("sessionLength",1)}}>+</button>
            </div>
        </div>
        <div className="container my-4" style={{border: "3px solid #17a2b8", borderRadius: "20px", maxWidth: "300px", margin: "0 auto", padding: "5px"}}>
        <div className="timer">
            <h2 id="timer-label">{timerlabel}</h2>
            <span id="time-left" className={`fs-1 fw-bold text-${(timeLeft < 60)?'danger':'white'}`}>{formatTime(timeLeft)}</span>
        </div>
        <div className="timer-controls">
            <button className='btn btn-info btn-sm mx-2 my-2' id="start_stop" onClick={handleStartStop}>Start/Stop</button>
            <audio ref={audioRef} id="beep" src={`/bell-ringing.mp3`} />
            <button className='btn btn-info btn-sm mx-2 my-2' id="reset" onClick={handleResetClick}>Reset</button>
        </div>
        </div>
    </div>
  )
}
