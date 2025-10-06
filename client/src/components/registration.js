import Logo from '../images/brllogo.png'
import banner from '../images/Group 79.png';
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../helper/Auth";

const Signup = () => {
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        rollNumber: "",
        phoneNumber: "",
        branch: "",
        error: "",
        loading: false,
        success: false
    });

    const { name, email, password, rollNumber, phoneNumber, branch, error, loading, success } = values;

    const handleChange = name => event => {
        setValues({ ...values, error: false, [name]: event.target.value });
    };

    const onSubmit = event => {
        event.preventDefault();
        setValues({ ...values, error: false, loading: true });
        signup({ name, email, password, rollNumber, phoneNumber, branch })
            .then(data => {
                if (data.success === false) {
                    setValues({ ...values, error: data.error.message, success: false, loading: false });
                } else {
                    setValues({
                        ...values,
                        name: "",
                        email: "",
                        password: "",
                        rollNumber: "",
                        phoneNumber: "",
                        branch: "",
                        error: "",
                        success: true
                    });
                }
            })
            .catch(console.log("Error in signup"));
    };

    const signUpForm = () => {
        return (
            <div className="container-fluid main" >
                <img src={Logo} alt="logo" className="logo" />
                <div className="card center">
                    <div className="row p-5">
                        <div className="col-md-6 d-flex align-items-center justify-content-center">
                            <div>
                                <form>
                                    <h1 style={{ marginBottom: '2rem' }}>Sign Up</h1>
                                    <div className="form-group">
                                        <input type="text" className="form-control" onChange={handleChange("name")} value={name} placeholder="Enter Name" />
                                    </div>
                                    <div className="form-group">
                                        <input type="email" className="form-control" onChange={handleChange("email")} value={email} aria-describedby="emailHelp" placeholder="Enter Email" />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-control" onChange={handleChange("password")} value={password} placeholder="Password" />
                                    </div>
                                    <div className="form-group">
                                        <input type="text" className="form-control" onChange={handleChange("rollNumber")} value={rollNumber} placeholder="Enter Roll Number" />
                                    </div>
                                    <div className="form-group">
                                        <input type="text" className="form-control" onChange={handleChange("phoneNumber")} value={phoneNumber} placeholder="Enter Mobile Number" />
                                    </div>
                                    <div className="form-group">
                                        <select defaultValue={''} className="form-control" onChange={handleChange("branch")} value={branch}>
                                            <option value="" disabled>Branch</option>
                                            <option value="CS">CS</option>
                                            <option value="IT">IT</option>
                                            <option value="EC">EC</option>
                                            <option value="ME">ME</option>
                                        </select>
                                    </div>
                                    <div className="d-flex">
                                        <Link to=''><i className="fas fa-arrow-circle-left next fa-3x" aria-hidden="true" style={{ float: "left" }}></i></Link>
                                        <button type="submit" className="btn btn-primary ml-2" style={{ float: "right", fontSize: "20px" }} onClick={onSubmit}>Register</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-6 d-flex align-items-center justify-content-center">
                            <img src={banner} alt="banner" style={{ maxWidth: '-webkit-fill-available' }} />
                        </div>
                    </div>
                </div>
            </div >
        );
    };

    const loadingMessage = () => {
        return (
            loading && (
                <div className="alert alert-info position-absolute w-100">
                    <h2>Loading...</h2>
                </div>
            )
        );
    };

    const successMessage = () => {
        return (
            <div className="alert alert-success position-absolute w-100" style={{ display: success ? "" : "none" }}>
                <h2>New account was created successfully.</h2>
            </div>
        );
    };

    const errorMessage = () => {
        return (
            <div className="alert alert-danger position-absolute w-100" style={{ display: error ? "" : "none" }}>
                <h2>{error}</h2>
            </div>
        );
    };

    return (
        <>
            {loadingMessage()}
            {successMessage()}
            {errorMessage()}
            {signUpForm()}
        </>
    );
};

export default Signup;
