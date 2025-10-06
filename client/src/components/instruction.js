import CircularProgress from "@material-ui/core/CircularProgress";
import NavBar from "./nav";
import React, { useState, useEffect } from "react";
import { Redirect, withRouter, useParams } from "react-router-dom";
import { isAuthenticated } from "../helper/Auth";
import { getQuestions, getTestToken } from "../helper/Test";
import Webcam from "react-webcam";
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
  const [values, setValues] = useState({
    hour: JSON.parse(localStorage.getItem("test")).duration.hour ? JSON.parse(localStorage.getItem("test")).duration.hour : 0,
    minute: JSON.parse(localStorage.getItem("test")).duration.minute ? JSON.parse(localStorage.getItem("test")).duration.minute : 0,
    second: JSON.parse(localStorage.getItem("test")).duration.second ? JSON.parse(localStorage.getItem("test")).duration.second : 0,
    optional: JSON.parse(localStorage.getItem("test")).optionalCategory.length > 0 ? JSON.parse(localStorage.getItem("test")).optionalCategory : [],
    mandatory: JSON.parse(localStorage.getItem("test")).mandatoryCategory ? JSON.parse(localStorage.getItem("test")).mandatoryCategory : [],
    startTime: (new Date(JSON.parse(localStorage.getItem("test")).startTime)).toLocaleString(navigator.language || navigator.languages[0], {
      day: 'numeric', // numeric, 2-digit
      year: 'numeric', // numeric, 2-digit
      month: 'short', // numeric, 2-digit, long, short, narrow
      hour: 'numeric', // numeric, 2-digit
      minute: 'numeric', // numeric, 2-digit
    }),
    didRedirect: false,
    loading: false,
    isCameraOne: false,
    error: "",
    lang: JSON.parse(localStorage.getItem("test")).optionalCategory.length > 0 ? JSON.parse(localStorage.getItem("test")).optionalCategory[0] : null,
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
  } = values;

  const token = isAuthenticated();

  const { id } = useParams();

  const handleRedirect = async (event) => {
    if (isCameraOne === false) {
      setValues({ ...values, error: "Please Turn On Camera!" });
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
      .catch((err) => console.log("Error But Y?" + err));
    return function cleanup() {
      localStorage.removeItem("optional")
      localStorage.removeItem("mandatoryCategory")
    };
  }, []);

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
                      <Webcam id="cam" style={{ width: "inherit" }} />
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
      {information()}
      {performRedirect()}
    </>
  );
};

export default withRouter(Instruction);
