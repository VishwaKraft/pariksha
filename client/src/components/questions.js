import React, { useState, useEffect, useRef } from "react";
// import PropTypes from 'prop-types';
import NavBar from "./nav";
import { cheatingCounter } from "../helper/Test";
import { submitAnswer, endTest } from "../helper/Test";
import { Modal } from "react-bootstrap";
import Webcam from "react-webcam";

import CircularProgress from "@material-ui/core/CircularProgress";
import { Paper, Button } from "@material-ui/core";
import { withRouter } from "react-router";
const Questions = (props) => {
  const videoRef = useRef(null);

  const getLocalStorageItem = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
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
      isCameraOne: false,
      error: "",
    };
  });

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [endShow, setEndShow] = useState(false);
  const handleEndClose = () => setEndShow(false);
  const handleEndShow = () => setEndShow(true);

  const { hour, minute, second } = time;
  const { data, id, index, option, save, mark, loading, isCameraOne, error } =
    values;

  const handleChange = (name) => (event) => {
    document.getElementById("errorText").classList.remove("d-block");
    localStorage.setItem("index", event.currentTarget.value);
    var question = getLocalStorageItem("questions", []);
    const index = parseInt(event.currentTarget.value, 10);
    const questionId = question[index]?._id ?? null;
    var found = getLocalStorageItem("mark", []).find(
      (item) => item.question === questionId,
    );
    const option = found?.response ?? NaN;

    setValues({
      ...values,
      [name]: parseInt(index),
      id: questionId,
      option: option,
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
    if (hour === 0 && minute === 0 && second === 0) {
      var filteredResponse = getLocalStorageItem("mark", []).map((item) => {
        return { question: item.question, response: item.response };
      });
      endTest({ responses: filteredResponse })
        .then((data) => {
          if (!data.success) {
            setValues({ ...values, error: data.error });
            handleShow();
          } else {
            setValues({ ...values, end: true });
            cleanup();
            window.location.href = process.env.PUBLIC_URL + "/student/feedback";
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
            second: second,
            minute: minute,
          }),
        );
      }
      if (second === 0) {
        if (minute === 0) {
          if (hour === 0) {
            setValues({ ...values, error: "Test Has Ended" });
            cleanup();
            props.history.push("/student/feedback");
          } else {
            setTime((time) => ({
              hour: time.hour - 1,
              minute: 59,
              second: 59,
            }));
            localStorage.setItem(
              "time",
              JSON.stringify({
                hour: hour,
                second: second,
                minute: minute,
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
              second: second,
              minute: minute,
            }),
          );
        }
      }
    }, 1000);
    window.addEventListener("blur", onBlur);
    return function cleanup() {
      window.removeEventListener("blur", onBlur);
      clearInterval(timmer);
    };
    // eslint-disable-next-line
  }, [hour, minute, second]);

  const submit = () => {
    if (isNaN(option)) {
      setValues({ ...values, error: "Please Select Any Option!" });
      document.getElementById("errorText").classList.add("d-block");
    } else {
      setValues({ ...values, error: false, loading: true });
      let res = { question: id, response: parseInt(option) };
      submitAnswer(res)
        .then((data) => {
          if (data.err) {
            setValues({ ...values, error: data.err, loading: false });
            handleShow();
          } else if (data.error) {
            setValues({ ...values, error: data.error, loading: false });
            handleShow();
          } else if (data.message) {
            setValues({ ...values, error: data.message });
            props.history.push("/student/feedback");
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
            console.log(button.value);
            console.log(index);
            button.click();
          }
        })
        .catch((err) => console.log(err));
    }
  };
  const selectOption = (event) => {
    if (isCameraOne === false) {
      console.log("some");
      setValues({ ...values, error: "Please Turn On Camera!" });
      document.getElementById("errorText").classList.add("d-block");
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
    const options = [];
    for (const [i, value] of data[j].options.entries()) {
      options.push(
        <li className="py-md-1" key={i}>
          {" "}
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
        <input type="text" className="d-none" value={id} readonly />
        <ul style={{ listStyle: "none" }}>{options}</ul>
      </div>
    );
  };

  const errorMessage = () => {
    return (
      <>
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
      </>
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
          <Button variant="secondary" onClick={handleEndClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleRedirect}>
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
      .then((data) => {
        if (!data.success) {
          setValues({ ...values, error: data.error });
          handleShow();
        } else {
          setValues({ ...values, end: true });
          cleanup();
          window.location.href = process.env.PUBLIC_URL + "/student/feedback";
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
      document.getElementById("errorText").classList.add("d-block");
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
    navigator.mediaDevices
      .getUserMedia({
        video: {
          height: 200,
          width: 300,
        },
        audio: false,
      })
      .then((stream) => {
        setValues((values) => ({
          ...values,
          isCameraOne: true,
        }));
        document.getElementById("cam").srcObject = stream;
      })
      .catch((err) => console.log("Error But Y? " + err));
  }, [videoRef]);

  const questionPaper = () => {
    return (
      <>
        <Paper className="col-md-8 mx-4 p-5">
          <div className="row" style={{ height: "60vh", overflow: "scroll" }}>
            {displayQuestion(index)}
          </div>
          <div className="row">
            <div className="col-md-3">
              <div className="invalid-feedback text-center" id="errorText">
                {error}
              </div>
            </div>
            <div className="col-md-9" style={{ textAlign: "-webkit-right" }}>
              {index === 0 ? null : (
                <Button
                  className="m-1"
                  variant="outlined"
                  value={index - 1}
                  onClick={handleChange("index")}
                >
                  {" "}
                  Previous{" "}
                </Button>
              )}
              <Button className="m-1" variant="outlined" onClick={unmark}>
                Unmark
              </Button>
              <Button className="m-1" variant="outlined" onClick={submit}>
                {loading ? (
                  <>
                    <CircularProgress
                      color="light"
                      style={{
                        height: "1rem",
                        width: "1rem",
                        marginBottom: "-2px",
                      }}
                    />
                  </>
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
          <Paper className="row mb-4">
            <div className="col-md-12 text-center display-3 my-2">
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
            style={{
              backgroundColor: "white",
              flexFlow: "row wrap",
            }}
          >
            {data.map((value, i) => {
              return (
                <button
                  className={"" + questionClass(i)}
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

  return (
    <>
      {errorMessage()}
      <section className="student" style={{ height: "100vh", margin: "0" }}>
        <div>
          <NavBar>
            <div
              className="container"
              style={{ height: "70vh", marginTop: "3vh" }}
            >
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

export default withRouter(Questions);

function cleanup() {
  localStorage.removeItem("test-token");
  localStorage.removeItem("data");
  localStorage.removeItem("index");
  localStorage.removeItem("questions");
  localStorage.removeItem("time");
  localStorage.removeItem("save");
  localStorage.removeItem("mark");
}

