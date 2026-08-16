import React, { useState, useEffect } from "react";
import NavBar from "./nav";
import { cheatingCounter } from "../helper/Test";
import { submitAnswer, endTest } from "../helper/Test";
import { Modal } from "react-bootstrap";
import Webcam from "react-webcam";
import webSocketService from "../helper/WebSocketService";
import { isAuthenticated } from "../helper/Auth";
import CircularProgress from "@mui/material/CircularProgress";
import { Paper, Button } from "@mui/material";
import { useRouter } from "next/router";
import useStudentAuth from "../hooks/useStudentAuth";

const Questions = () => {
  const router = useRouter();
  const { loading: authLoading, authenticated } = useStudentAuth();

  const getLocalStorageItem = (key, defaultValue) => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error parsing localStorage item ${key}:`, error);
      return defaultValue;
    }
  };

  const [time, setTime] = useState(() => {
    const timeData = getLocalStorageItem("time", {
      hour: 0,
      minute: 0,
      second: 0,
    });
    return {
      hour: timeData.hour ?? 0,
      minute: timeData.minute ?? 0,
      second: timeData.second ?? 0,
    };
  });

  const [values, setValues] = useState(() => {
    const questions = getLocalStorageItem("questions", []);
    const save = getLocalStorageItem("save", []);
    const mark = getLocalStorageItem("mark", []);

    return {
      data: questions,
      id: questions[0]?._id ?? null,
      option: NaN,
      save: save,
      mark: mark,
      index: 0,
      loading: false,
      isCameraOne: true,
      error: "",
      end: false,
    };
  });

  useEffect(() => {
    if (!authenticated) return;
    const token = isAuthenticated();
    if (!token) return;

    const startStreaming = async () => {
      try {
        await webSocketService.connect(token);
        await webSocketService.startVideoStreaming();
        const testObj = JSON.parse(localStorage.getItem("test")) || {};
        webSocketService.sendStreamUpdate({
          testId: testObj._id,
          testName: testObj.title || 'Unknown Test',
          status: 'active',
          stage: 'exam'
        });
        console.log('Webcam streaming active during exam');
      } catch (err) {
        console.warn('Webcam streaming unavailable during exam:', err.message);
      }
    };

    startStreaming();

    return () => {
      webSocketService.stopVideoStreaming();
      webSocketService.disconnect();
    };
  }, [authenticated]);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [endShow, setEndShow] = useState(false);
  const handleEndClose = () => setEndShow(false);
  const handleEndShow = () => setEndShow(true);

  const { hour, minute, second } = time;
  const { data, id, index, option, save, mark, loading, isCameraOne, error, end } = values;

  const handleChange = (name) => (event) => {
    document.getElementById("errorText")?.classList.remove("d-block");
    localStorage.setItem("index", event.currentTarget.value);
    var question = getLocalStorageItem("questions", []);
    const indexStr = event.currentTarget.value;
    const indexInt = parseInt(indexStr, 10);
    const questionId = question[indexInt]?._id ?? null;
    var found = getLocalStorageItem("mark", []).find(
      (item) => item.question === questionId,
    );
    const selectedOption = found?.response ?? NaN;

    setValues({
      ...values,
      [name]: indexInt,
      id: questionId,
      option: selectedOption,
    });
  };

  const onBlur = () => {
    if (hour !== 0 || minute !== 0 || second !== 0) {
      cheatingCounter().then((result) => {
        setValues({
          ...values,
          error: "This is Not Allowed And Will Be Reported to Admin!",
        });
      });
      handleShow();
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    if (hour === 0 && minute === 0 && second === 0 && !end) {
      var filteredResponse = getLocalStorageItem("mark", []).map((item) => {
        return { question: item.question, response: item.response };
      });
      endTest({ responses: filteredResponse })
        .then((data) => {
          if (data && data.success === false) {
            setValues(v => ({ ...v, error: data.error.message }));
            handleShow();
          } else {
            setValues(v => ({ ...v, end: true }));
            cleanup();
            router.push("/student/feedback");
          }
        })
        .catch((error) => {
          return error;
        });
    }

    let timmer = setInterval(() => {
      if (second > 0) {
        setTime((time) => ({ ...time, second: time.second - 1 }));
        localStorage.setItem(
          "time",
          JSON.stringify({
            hour: hour,
            second: second - 1,
            minute: minute,
          }),
        );
      }
      if (second === 0) {
        if (minute === 0) {
          if (hour === 0) {
            setValues(v => ({ ...v, error: "Test Has Ended" }));
            cleanup();
            if (!end) router.push("/student/feedback");
          } else {
            setTime((time) => ({
              hour: time.hour - 1,
              minute: 59,
              second: 59,
            }));
            localStorage.setItem(
              "time",
              JSON.stringify({
                hour: hour - 1,
                second: 59,
                minute: 59,
              }),
            );
          }
        } else {
          setTime((time) => ({
            ...time,
            minute: minute - 1,
            second: 59,
          }));
          localStorage.setItem(
            "time",
            JSON.stringify({
              hour: hour,
              second: 59,
              minute: minute - 1,
            }),
          );
        }
      }
    }, 1000);
    window.addEventListener("blur", onBlur);
    return function cleanupEffect() {
      window.removeEventListener("blur", onBlur);
      clearInterval(timmer);
    };
    // eslint-disable-next-line
  }, [hour, minute, second, authenticated, end]);

  const submit = () => {
    if (isNaN(option)) {
      setValues({ ...values, error: "Please Select Any Option!" });
      document.getElementById("errorText")?.classList.add("d-block");
    } else {
      setValues({ ...values, error: false, loading: true });
      let res = { question: id, response: parseInt(option) };
      submitAnswer(res)
        .then((respData) => {
          if (respData && respData.success === false) {
            setValues({ ...values, error: respData.error.message, loading: false });
            handleShow();
          } else if (respData && respData.message) {
            setValues({ ...values, error: respData.message, loading: false });
            router.push("/student/feedback");
          } else {
            var arr = save.slice();
            var foundIndex = save.findIndex((x) => x.question === id);
            if (foundIndex === -1) {
              res.index = index;
              arr.push(res);
            } else {
              arr[foundIndex].response = parseInt(option);
            }
            localStorage.setItem("save", JSON.stringify(arr));
            setValues({
              ...values,
              loading: false,
              save: arr,
            });
            var button = document.getElementById("next");
            if (button) button.click();
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const selectOption = (event) => {
    if (isCameraOne === false) {
      setValues({ ...values, error: "Please Turn On Camera!" });
      document.getElementById("errorText")?.classList.add("d-block");
    } else {
      let setOption = event.target.value;
      var arr = mark.slice();
      var foundIndex = mark.findIndex((x) => x.question === id);
      if (foundIndex === -1) {
        arr.push({ question: id, response: parseInt(setOption), index: index });
      } else {
        arr[foundIndex].response = parseInt(setOption);
      }
      localStorage.setItem("mark", JSON.stringify(arr));
      setValues((values) => ({
        ...values,
        mark: arr,
        option: setOption,
      }));
    }
  };

  const questionClass = (num) => {
    let names = ["col-2", "btn", "rounded-circle", "text-center", "m-2"];
    var markIndex = mark.findIndex((x) => x.index === num);
    var saveIndex = save.findIndex((x) => x.index === num);
    if (index === num) names.push("btn-info");
    else if (saveIndex !== -1) names.push("btn-success");
    else if (markIndex !== -1) names.push("btn-warning");
    else names.push("btn-light");
    return names.join(" ");
  };

  const displayQuestion = (j) => {
    if (!data || !data[j]) return null;
    const options = [];
    for (const [i, value] of data[j].options.entries()) {
      options.push(
        <li className="py-md-1" key={i}>
          <input
            className="mx-3"
            type="radio"
            name={`option${id}`}
            value={i + 1}
            onChange={selectOption}
            key={i}
            checked={parseInt(option) === i + 1}
          />
          {value}
        </li>,
      );
    }
    return (
      <div className="col-md-12">
        <h5 style={{ display: "inline-block" }} className="py-md-3">
          {index + 1}. &nbsp;
          {data[j].question} <br />
          {data[j].QuestionPic && data[j].QuestionPic !== "" ? (
            <img src={data[j].QuestionPic} alt="question" />
          ) : (
            <></>
          )}
        </h5>
        <input type="text" className="d-none" value={id || ""} readOnly />
        <ul style={{ listStyle: "none" }}>{options}</ul>
      </div>
    );
  };

  const errorMessage = () => {
    return (
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Test Portal</Modal.Title>
        </Modal.Header>
        <Modal.Body>{error}</Modal.Body>
        <Modal.Footer>
          <Button variant="outlined" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const showConfirmation = () => {
    return (
      <Modal show={endShow} onHide={handleEndClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Test Portal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are You Sure? Once Submitted You Can Not Attempt Again.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="contained" color="secondary" onClick={handleEndClose}>
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={handleRedirect}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const handleRedirect = (event) => {
    handleClose();
    var filteredResponse = getLocalStorageItem("mark", []).map((item) => {
      return { question: item.question, response: item.response };
    });
    endTest({ responses: filteredResponse })
      .then((respData) => {
        if (respData && respData.success === false) {
          setValues({ ...values, error: respData.error.message });
          handleShow();
        } else {
          setValues({ ...values, end: true });
          cleanup();
          router.push("/student/feedback");
        }
      })
      .catch((error) => {
        return error;
      });
  };

  const unmark = () => {
    var saveIndex = save.findIndex((x) => x.index === index);
    if (saveIndex !== -1) {
      setValues({ ...values, error: "Can Not Unmark Saved Response!" });
      document.getElementById("errorText")?.classList.add("d-block");
    } else {
      var arr = mark.slice();
      var temp = arr.filter((item) => item.index !== index);
      localStorage.setItem("mark", JSON.stringify(temp));
      setValues((values) => ({
        ...values,
        mark: temp,
        option: NaN,
      }));
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    const initializeWebcam = async () => {
      try {
        const token = await isAuthenticated();
        if (!token) {
          setValues(prev => ({ ...prev, error: "Authentication required" }));
          return;
        }
        await webSocketService.connect(token);
        const stream = await webSocketService.startVideoStreaming();

        setValues(prev => ({
          ...prev,
          isCameraOne: true,
        }));

        if (document.getElementById("cam")) {
          document.getElementById("cam").srcObject = stream;
        }

        const updateInterval = setInterval(() => {
          webSocketService.sendStreamUpdate({
            testId: localStorage.getItem("testId"),
            questionIndex: index,
            timeRemaining: `${hour}:${minute}:${second}`,
            status: 'active'
          });
        }, 5000);

        return () => {
          clearInterval(updateInterval);
          webSocketService.stopVideoStreaming();
        };
      } catch (error) {
        console.error("Webcam initialization error:", error);
        let errorMessage = "Camera access denied or not available";
        if (error.message) {
            if (error.message.includes('Camera access denied')) errorMessage = "Camera access denied.";
            else if (error.message.includes('No camera found')) errorMessage = "No camera found.";
            else if (error.message.includes('already in use')) errorMessage = "Camera already in use.";
        }
        setValues(prev => ({
          ...prev,
          error: errorMessage,
          isCameraOne: false,
        }));
      }
    };

    initializeWebcam();

    return () => {
      webSocketService.stopVideoStreaming();
      webSocketService.disconnect();
    };
  }, [hour, minute, second, index, authenticated]);

  const questionPaper = () => {
    return (
      <>
        <Paper className="col-md-8 mx-4 p-5" elevation={3}>
          <div className="row" style={{ height: "60vh", overflow: "scroll" }}>
            {displayQuestion(index)}
          </div>
          <div className="row mt-3">
            <div className="col-md-3">
              <div className="invalid-feedback text-center" id="errorText">
                {error}
              </div>
            </div>
            <div className="col-md-9" style={{ textAlign: "right" }}>
              {index === 0 ? null : (
                <Button
                  className="m-1"
                  variant="outlined"
                  value={index - 1}
                  onClick={handleChange("index")}
                >
                  Previous
                </Button>
              )}
              <Button className="m-1" variant="outlined" onClick={unmark}>
                Unmark
              </Button>
              <Button className="m-1" variant="outlined" onClick={submit}>
                {loading ? (
                  <CircularProgress
                    color="inherit"
                    style={{ height: "1rem", width: "1rem" }}
                  />
                ) : (
                  "Submit Answer"
                )}
              </Button>
              {index === data.length - 1 ? null : (
                <Button
                  variant="outlined"
                  className="m-1"
                  id="next"
                  value={index + 1}
                  onClick={handleChange("index")}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </Paper>
        <div className="col-md-3 m-auto">
          <Paper className="row mb-4" elevation={3}>
            <div className="col-md-12 text-center display-3 my-2" style={{fontSize: "2rem", padding: "20px 0"}}>
              {hour}:{minute < 10 ? `0${minute}` : minute}:
              {second < 10 ? `0${second}` : second}
            </div>
          </Paper>
          <div className="mb-4">
            <Button
              variant="contained"
              style={{ width: "100%", background: "#dc3545", color: "white" }}
              onClick={handleEndShow}
            >
              End Test
            </Button>
          </div>
          <Paper
            className="row justify-content-center py-2"
            elevation={3}
            style={{ backgroundColor: "white", flexFlow: "row wrap" }}
          >
            {data.map((value, i) => {
              return (
                <button
                  key={i}
                  className={questionClass(i)}
                  value={i}
                  style={{ lineHeight: "2rem" }}
                  onClick={handleChange("index")}
                >
                  {i + 1}
                </button>
              );
            })}
          </Paper>
        </div>
      </>
    );
  };

  if (authLoading || !authenticated) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></div>;

  return (
    <>
      {errorMessage()}
      <section className="student" style={{ height: "100vh", margin: "0" }}>
        <div>
          <NavBar>
            <div className="container" style={{ height: "70vh", marginTop: "3vh" }}>
              <div className="row h-100">{questionPaper()}</div>
              <Webcam id="cam" style={{ display: "none" }} />
            </div>
          </NavBar>
        </div>
      </section>
      {showConfirmation()}
    </>
  );
};

export default Questions;

function cleanup() {
  if (typeof window !== 'undefined') {
      localStorage.removeItem("test-token");
      localStorage.removeItem("data");
      localStorage.removeItem("index");
      localStorage.removeItem("questions");
      localStorage.removeItem("time");
      localStorage.removeItem("save");
      localStorage.removeItem("mark");
  }
}
