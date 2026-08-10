import React, { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticated } from "../helper/Auth";

const StudentRoute = ({ component: Component, ...rest }) => {
  const [state, setState] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    async function fetchData() {
      console.log("Router Check : ")
      let result = await isAuthenticated();
      if (result === false) {
        setState(false)
      }
    }
    fetchData();
  }, [state]);

  return (
    <Route
      {...rest}
      render={(props) =>
        state ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/",
              search: `?redirect=${props.location.pathname}`,
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default StudentRoute;
