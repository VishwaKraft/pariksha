import CircularProgress from "@material-ui/core/CircularProgress";
import NavBar from "./nav";
import React, { useState, useEffect, useCallback } from "react";
import { Redirect, withRouter, useParams } from "react-router-dom";
import { isAuthenticated } from "../helper/Auth";
import { getQuestions, getTestToken, selectTest } from "../helper/Test";
import Webcam from "react-webcam";
import webSocketService from "../helper/WebSocketService";
import CameraTest from "./CameraTest";
import { Box, Button, Container, FormControl, Grid, InputLabel, makeStyles, MenuItem, Paper, Select } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  pl: {
    padding: theme.spacing(5),
  },
  pr: {
    padding: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
}));


const Instruction = () => {
  const [testLoaded, setTestLoaded] = useState(false);
  const [values, setValues] = useState({
    hour: 0,
    minute: 0,
    second: 0,
    optional: [],
    mandatory: [],
    startTime: "",
    didRedirect: false,
    loading: false,
    isCameraOne: false,
    error: "",
    lang: null,
    showCameraTest: false,
  });

  const {
    hour,
    minute,
    second,
    isCameraOne,
    didRedirect,
    loading,
    optional,
    mandatory,
    startTime,
    error,
    lang,
    showCameraTest,
  } = values;

  const token = isAuthenticated();

  const { id } = useParams();

  useEffect(() => {
    let testObj = null;
    try {
      testObj = JSON.parse(localStorage.getItem("test"));
    } catch (e) {}

    const initializeTest = (testData) => {
      localStorage.setItem("test", JSON.stringify(testData));
      setValues(prev => ({
        ...prev,
        hour: testData.duration && testData.duration.hour ? testData.duration.hour : 0,
        minute: testData.duration && testData.duration.minute ? testData.duration.minute : 0,
        second: testData.duration && testData.duration.second ? testData.duration.second : 0,
        optional: testData.optionalCategory && testData.optionalCategory.length > 0 ? testData.optionalCategory : [],
        mandatory: testData.mandatoryCategory ? testData.mandatoryCategory : [],
        startTime: testData.startTime ? (new Date(testData.startTime)).toLocaleString(navigator.language || navigator.languages[0], {
          day: 'numeric', year: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric'
        }) : "",
        lang: testData.optionalCategory && testData.optionalCategory.length > 0 ? testData.optionalCategory[0] : null,
      }));
      setTestLoaded(true);
    };

    if (testObj && testObj._id === id) {
      initializeTest(testObj);
    } else {
      selectTest(id).then(res => {
        if (res && res.data) {
          initializeTest(res.data);
        } else {
          setValues(prev => ({ ...prev, error: "Failed to load test details" }));
          setTestLoaded(true);
        }
      }).catch(err => {
        setValues(prev => ({ ...prev, error: "Failed to load test details" }));
        setTestLoaded(true);
      });
    }
  }, [id]);

  const handleRedirect = async (event) => {
    if (isCameraOne === false) {
      setValues({ ...values, error: "Please Turn On Camera!", showCameraTest: true });
      document.getElementById("errorText").classList.add("d-block");
    } else {
      setValues({ ...values, error: false, loading: true });
      getTestToken(id).then(result => {
        if (result.success === true && result.data.token) {
          localStorage.setItem("test-token", result.data.token)
          getQuestions(lang)
            .then((res) => {
              if (res.success === true && res.data.res_questions) {
                localStorage.setItem(
                  "questions",
                  JSON.stringify(res.data.res_questions)
                );
                localStorage.setItem("time", JSON.stringify(res.data.time));
                localStorage.setItem("save", JSON.stringify([]));
                localStorage.setItem("mark", JSON.stringify([]));
                setValues((values) => ({
                  ...values,
                  loading: false,
                  didRedirect: true,
                }));
              } else {
                setValues({ ...values, error: res.error.message });
                document.getElementById("errorText").classList.add("d-block");
              }
            })
            .catch((err) => console.log(err));
        } else {
          setValues({ ...values, error: result.error.message });
          document.getElementById("errorText").classList.add("d-block");
        }
        console.log(result)
      }).catch((err) => console.log(err));

    }
  };

  const performRedirect = () => {
    if (didRedirect === true && loading === false) {
      if (token) {
        return <Redirect to="/student/questions" />;
      }
    }
    if (localStorage.getItem("test-token")) {
      return <Redirect to="/student/questions" />;
    }
    if (!isAuthenticated() || error === "Token is not valid") {
      console.log("Instruction Token" + isAuthenticated());
      localStorage.removeItem("token");
      return <Redirect to="/" />;
    }
  };

  const change = (event) => {
    var val = event.target.value;
    setValues((values) => ({
      ...values,
      lang: val,
    }));
  };

  const initializeWebcam = useCallback(async () => {
    try {
      // Step 1: Verify camera access first (independent of WebSocket)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15, max: 30 } },
        audio: false
      });

      // Camera is confirmed working — mark it on immediately
      setValues(prev => ({
        ...prev,
        isCameraOne: true,
        error: "",
      }));

      // Stop this probe stream (Webcam component manages its own stream)
      stream.getTracks().forEach(track => track.stop());

      // Step 2: Try WebSocket (non-blocking — failure won't prevent test start)
      try {
        const token = isAuthenticated();
        if (token) {
          await webSocketService.connect(token);
          await webSocketService.startVideoStreaming();
          const testObj = JSON.parse(localStorage.getItem("test")) || {};
          webSocketService.sendStreamUpdate({
            testId: id,
            testName: testObj.title || 'Unknown Test',
            status: 'preparing',
            stage: 'instructions'
          });
        }
      } catch (wsError) {
        // WebSocket failure is non-fatal — camera is still confirmed on
        console.warn("WebSocket streaming unavailable (non-fatal):", wsError.message);
      }

    } catch (error) {
      console.error("Webcam initialization error:", error);
      let errorMessage = "Camera access denied or not available";

      if (error.name === 'NotAllowedError' || error.message.includes('Camera access denied')) {
        errorMessage = "Camera access denied. Please allow camera permissions and refresh the page.";
      } else if (error.name === 'NotFoundError' || error.message.includes('No camera found')) {
        errorMessage = "No camera found. Please connect a camera and try again.";
      } else if (error.name === 'NotReadableError' || error.message.includes('already in use')) {
        errorMessage = "Camera is already in use by another application. Please close other apps using the camera.";
      } else if (error.message.includes('not supported')) {
        errorMessage = "Camera access not supported in this browser. Please use Chrome or Firefox.";
      }

      setValues(prev => ({
        ...prev,
        error: errorMessage,
        isCameraOne: false,
      }));
    }
  }, [id]);

  useEffect(() => {
    initializeWebcam();

    return function cleanup() {
      // Stop video streaming but don't disconnect — questions.js will reconnect
      webSocketService.stopVideoStreaming();
      localStorage.removeItem("optional");
      localStorage.removeItem("mandatoryCategory");
    };
  }, [id, initializeWebcam]);

  const classes = useStyles();

  const information = () => {
    return (
      <div>
        <NavBar>
        <Container>
          <Box my={4}>
            <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
              spacing={6}
              margin={2}>
              <Grid item>
                <Paper className={classes.pl}>
                  <h1>Instruction</h1>
                  <ul>
                    <li>Have a stable internet connection.</li>
                    <li>
                      This is a Web Proctored Exam. Kindly allow camera Permission
                    </li>
                    <li>
                      Do Not "Refresh" Or "Close" this tab or else you will be logged
                      out.
                    </li>
                    <li>
                      The test button will be active at {startTime} after which you will lose time for the test.
                    </li>
                    <li>
                      There would be questions for each
                      {<ul>
                        {
                          mandatory.map(categ => (
                            <li>
                              {categ.toUpperCase()}
                            </li>
                          ))
                        }
                        {optional.length > 0 ? (<li> Any One : {
                          optional.map(categ => (
                            <span>{categ.toUpperCase()} &nbsp;</span>
                          ))
                        }</li>) : <></>}
                      </ul>}

                    </li>
                    <li>Test will be auto submit after the time expires.</li>
                    <li>
                      Switching tabs is strictly prohibited and would be considered in the final evaluation.
                    </li>
                    <li>
                      Answers once submitted cannot be unmarked but can be modified.
                    </li>
                    <li>
                      Marked answers will not be Submitted at the End of test.
                    </li>
                    <li>
                      <b>
                        You will be awarded 1 mark for Correct Answer and there is
                        no negative marking.
                      </b>
                    </li>
                  </ul>
                </Paper>
              </Grid>
              <Grid item>
                <Paper className={classes.pr}>
                  <div className="row h-20">
                    <div className="col-md-12 my-3 text-center display-3">
                      <span id="clock">
                        {hour}:{minute < 10 ? `0${minute}` : minute}:
                        {second < 10 ? `0${second}` : second}
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <Webcam id="cam" style={{ width: "100%", maxWidth: "320px", height: "240px", margin: "0 auto", display: "block" }} />
                    </div>
                  </div>
                  <div className="row">
                    <div
                      className="col-md-12"
                      style={{ textAlign: "-webkit-center" }}
                    >
                      <FormControl className={classes.formControl}>
                        {optional.length !== 0 ? <InputLabel id="demo-simple-select-outlined-label">Language</InputLabel> : <></>}
                        {optional.length !== 0 ? <Select
                          labelId="demo-simple-select-outlined-label"
                          id="demo-simple-select-outlined"
                          value={lang}
                          onChange={change}
                          label="land"
                        >
                          {optional.map(item => <MenuItem value={item}>{item.toUpperCase()}</MenuItem>)}
                        </Select> : <></>}
                      </FormControl>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 mb-2 text-center">
                      <Button
                        variant="contained" color="primary"
                        onClick={handleRedirect}
                      >
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
                          "Start Test"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="row">
                    <div
                      className="col-md-12"
                      style={{ textAlign: "-webkit-center" }}
                    >
                      <div
                        className="invalid-feedback text-center"
                        id="errorText"
                      >
                        {error}
                      </div>
                    </div>
                  </div>
                  {showCameraTest && (
                    <div className="row" style={{ marginTop: "20px" }}>
                      <div className="col-md-12">
                        <CameraTest
                          onCameraReady={() => {
                            setValues(prev => ({ ...prev, showCameraTest: false, error: "" }));
                            document.getElementById("errorText").classList.remove("d-block");
                            // Retry camera initialization
                            initializeWebcam();
                          }}
                          onError={(errorMsg) => {
                            setValues(prev => ({ ...prev, error: errorMsg }));
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
        </NavBar>
      </div>
    );
  };

  return (
    <>
      {!testLoaded ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      ) : (
        information()
      )}
      {performRedirect()}
    </>
  );
};

export default withRouter(Instruction);
