import React, { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import StudentRoute from "./routes/StudentRoute";
import Dashboard from "./components/dashboard";
import Home from "./components/home";
import Instruction from "./components/instruction";
import QuestionManageAdmin from "./components/admin/question/Manage";
import QuestionCreateAdmin from "./components/admin/question/Create";
import FeedbackAdmin from "./components/admin/Feedback";
import ResultAdmin from "./components/admin/Result";
import TestCreateAdmin from "./components/admin/test/Create";
import TestManageAdmin from "./components/admin/test/Manage";
import SignIn from "./components/admin/Signin";
import AdminRoute from "./routes/AdminRoute";
import Main from "./components/admin/Main";
import UserAdmin from "./components/admin/User";
import WebcamMonitor from "./components/admin/WebcamMonitor";
import Feedback from "./components/feedback";
import Question from "./components/questions";

export default class App extends Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route path="/mobile">
            <h1>Not For Mobile</h1>
          </Route>
          <AdminRoute path="/admin/main" component={Main} />
          <AdminRoute path="/admin/user" component={UserAdmin} />
          <AdminRoute path="/admin/webcam" component={WebcamMonitor} />
          <AdminRoute path="/admin/question/manage" component={QuestionManageAdmin} />
          <AdminRoute path="/admin/question/create" component={QuestionCreateAdmin} />
          <AdminRoute path="/admin/feedback" component={FeedbackAdmin} />
          <AdminRoute path="/admin/test/create" component={TestCreateAdmin} />
          <AdminRoute path="/admin/test/manage" component={TestManageAdmin} />
          <AdminRoute path="/admin/result" component={ResultAdmin} />
          <Route path="/admin" component={SignIn} />
          <StudentRoute path="/student/dashboard" component={Dashboard} />
          <StudentRoute path="/student/questions" component={Question} />
          <StudentRoute path="/student/feedback" component={Feedback} />
          <StudentRoute path="/student/test/:id" component={Instruction} />
          <Route path="/" component={Home} />
          <Route path="*">
            <h1>Not Found</h1>
          </Route>
        </Switch>
      </Router>
    );
  }
}
