import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { submitFeedback } from "../helper/Test";
import { useRouter } from "next/router";
import NavBar from "./nav";
import { Paper, Button, Grid } from "@mui/material";
import useStudentAuth from "../hooks/useStudentAuth";

export default function Feedback() {
  const router = useRouter();
  const { loading: authLoading, authenticated } = useStudentAuth();
  
  const [values, setValues] = useState({
    feedbackText: "",
    quality: "",
    loading: false,
    didRedirect: false,
    error: ""
  });

  const { feedbackText, quality, loading, didRedirect, error } = values;

  useEffect(() => {
    if (didRedirect) {
      router.push("/student/dashboard");
    }
  }, [didRedirect, router]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (quality === "" || feedbackText === "") {
      if (feedbackText === "") {
        setValues(v => ({ ...v, error: "Please Specify FeedBack!" }));
        document.getElementById("errorText")?.classList.add("d-block");
      }
      if (quality === "") {
        setValues(v => ({ ...v, error: "Please Specify Rating!" }));
        document.getElementById("errorText")?.classList.add("d-block");
      }
    } else {
      setValues(v => ({ ...v, loading: true }));
      submitFeedback({
        quality: quality,
        feedback: feedbackText,
      })
        .then((data) => {
          console.log("Success");
          setValues(v => ({ ...v, didRedirect: true }));
        })
        .catch((error) => {
          setValues(v => ({ ...v, error: "Submission failed", loading: false }));
        });
    }
  };

  const handleChange = (name) => (event) => {
    let data = event.target.value;
    document.getElementById("errorText")?.classList.remove("d-block");
    setValues(v => ({
      ...v,
      [name]: data,
    }));
  };

  if (authLoading || !authenticated) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></div>;

  return (
    <>
      <NavBar>
      <Grid container alignContent="center" justifyContent="center">
        <Grid item component={Paper} style={{ padding: "2rem", marginTop: "1.5rem", textAlign: "center", width: "80%" }}>
          <h1>FEEDBACK</h1>
          <p>
            We would love to hear your thoughts, concerns or problems with
            anything so we can improve !
          </p>
          <p>Take a moment to fill out this form.</p>

          <h3>How Do You Rate Your Overall Experience ?</h3>

          <Grid container alignContent="center" justifyContent="center" spacing={2} style={{margin: '20px 0'}}>
            <Grid item lg={4} md={4} sm={4} xs={4}>
              <input
                onChange={handleChange("quality")}
                type="radio"
                name="exp"
                value="Good"
              />{" "}
              Good
            </Grid>
            <Grid item lg={4} md={4} sm={4} xs={4}>
              <input
                onChange={handleChange("quality")}
                type="radio"
                name="exp"
                value="Average"
              />{" "}
              Average
            </Grid>
            <Grid item lg={4} md={4} sm={4} xs={4}>
              <input
                onChange={handleChange("quality")}
                type="radio"
                name="exp"
                value="Bad"
              />{" "}
              Bad
            </Grid>
          </Grid>
          <div className="row justify-content-center mb-5 mt-2" style={{display: 'flex', justifyContent: 'center'}}>
            <form style={{ width: "50%" }}>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="5"
                  id="Suggestion"
                  onChange={handleChange("feedbackText")}
                  value={feedbackText}
                  placeholder="Enter Your Suggestion"
                  style={{width: '100%', marginBottom: '10px'}}
                ></textarea>
                <div
                  className="invalid-feedback text-center pt-2"
                  id="errorText"
                  style={{color: 'red', marginBottom: '10px'}}
                >
                  {error}
                </div>
              </div>
              <Button
                type="submit"
                variant="contained"
                style={{ fontSize: "20px" }}
                onClick={onSubmit}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      color="inherit"
                      style={{
                        height: "1.7rem",
                        width: "1.7rem",
                        marginBottom: "-2px",
                      }}
                    />
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </div>
        </Grid>
      </Grid>
      </NavBar>
    </>
  );
}
