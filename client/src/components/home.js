import React, { useEffect, useState } from "react";
import logo from "../images/brllogo.png";
import footer1 from "../images/Mask Group 4.png";
import footer2 from "../images/Mask Group 5.png";
import banner from "../images/Group 72.svg";
import { withRouter } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { CircularProgress, Button } from "@material-ui/core";
import { authenticate, isAuthenticated, signin } from "../helper/Auth";
import { toast } from 'react-toastify';
import GoogleLogin from "react-google-login";
function Home(props) {

  const [values, setValues] = useState({
    email: "amosaini@deloitte.com",
    password: "123456789",
    error: "",
    loading: false,
  });

  const { email, password, error, loading } = values;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (name) => (event) => {
    document.getElementById("LoginUser").classList.remove("is-invalid");
    document.getElementById("LoginPass").classList.remove("is-invalid");
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  useEffect(() => {
    async function getAuthStatus() {
      const token = await isAuthenticated();
      if (!!token) {
        props.history.push("/student/dashboard");
      }
    }
    getAuthStatus()
  }, [props.history])

  const onSubmit = (event) => {
    event.preventDefault();
    if (password === "" || email === "") {
      setValues({ ...values, error: false, loading: false });
      if (password === "")
        document.getElementById("LoginPass").classList.add("is-invalid");
      if (email === "")
        document.getElementById("LoginUser").classList.add("is-invalid");
    } else {
      setValues({ ...values, error: false, loading: true });
      signin({ email, password })
        .then((data) => {
          if (data.error) {
            setValues({ ...values, error: data.error, loading: false });
            handleShow();
          } else {
            authenticate(data, () => {
              toast.success('Login Successfully!');
              props.history.push("/student/dashboard");
            });
          }
        })
        .catch((error) => {
          return error;
        });
    }
  };

  const handleLogin = async googleData => {
    try {
      const res = await fetch(process.env.REACT_APP_API_URL + "/api/v1/auth/google", {
        method: "POST",
        body: JSON.stringify({
          token: googleData.tokenId
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      const data = await res.json()
      
      if (data.success === false) {
        toast.error(data.error || "Authentication failed");
        return;
      }
      
      authenticate(data, () => {
        toast.success('Login Successfully!');
        props.history.push("/student/dashboard");
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast.error("Authentication error occurred!")
    }

  }

  const errorMessage = () => {
    return (
      <>
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Enter Details Carefully</Modal.Title>
          </Modal.Header>
          <Modal.Body>{error}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  const home = () => {
    return (
      <div>
        <div>
          <img
            src={logo}
            alt="logo"
            className="img-fluid pl-4 pt-4 logo float-left"
          />
          <img
            src={banner}
            alt="banner"
            className="img-fluid pl-4 banner float-right"
          />
          <div className="box">
            <p className="text mb-4">
              {" "}
              HU-
              PARIKSHA
              <br /> Test Portal{" "}
            </p>
            <div className="form-group">
              <input
                type="email"
                id="LoginUser"
                className="form-control"
                onChange={handleChange("email")}
                value={email}
                placeholder="Enter Email"
              />
              <div className="invalid-feedback text-left" id="UserError">
                Please Enter the Email!
              </div>
            </div>
            <div className="form-group">
              <input
                type="password"
                id="LoginPass"
                onChange={handleChange("password")}
                value={password}
                className="form-control"
                placeholder="Password"
              />
              <div className="invalid-feedback text-left" id="PassError">
                Please Enter the Password!
              </div>
            </div>
            <Button
              type="submit"
              variant="contained"
              onClick={onSubmit}
            >
              {loading ? (
                <>
                  <CircularProgress
                    color="light"
                    style={{
                      height: "1.5rem",
                      width: "1.5rem",
                      marginBottom: "-3px",
                    }}
                  />
                </>
              ) : (
                "Login"
              )}
            </Button>
            <span style={{ margin: "1rem" }}>OR
            </span>

            <GoogleLogin
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
              buttonText="Log in with Google"
              onSuccess={handleLogin}
              onFailure={handleLogin}
              cookiePolicy={'single_host_origin'}
              theme="dark"
            />
          </div>
        </div>
        <footer>
          <img
            src={footer1}
            alt="footer-img1"
            className="img-fluid mg-4"
          />
          <img
            src={footer2}
            alt="footer-img2"
            className="img-fluid float-right mg-5"
          />
        </footer>
      </div>
    )
  }

  return (
    <>
      {errorMessage()}
      {home()}
    </>
  );
}


export default withRouter(Home);