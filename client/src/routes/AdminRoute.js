import React from "react";
import { Route, Redirect } from "react-router-dom";
import Dashboard from "../components/admin/Dashboard";
import { isAuthenticatedAdmin } from "../helper/Auth";

const AdminRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticatedAdmin() ? (
            <Dashboard>
               <Component {...props} />
            </Dashboard>
        ) : (
          <Redirect
            to={{
              pathname: "/admin",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default AdminRoute;
