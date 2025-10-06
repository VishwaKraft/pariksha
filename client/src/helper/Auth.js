export const signup = (user) => {
  return fetch(process.env.REACT_APP_API_URL + `/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const signin = (user) => {
  return fetch(process.env.REACT_APP_API_URL + `/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const authenticate = (data, next) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.user.name);
    localStorage.setItem("email", data.user.email);
    if(data.user.profileUrl !== null && data.user.profileUrl !== "") {
      localStorage.setItem("profileUrl", data.user.profileUrl);
    }
    next();
  }
};

export const signout = (next) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    next();

    return fetch(process.env.REACT_APP_API_URL + `/logout`, {
      method: "GET",
    })
      .then((response) => console.log("logout success"))
      .catch((err) => console.log(err));
  }
};

export const isAuthenticated = () => {
  if (typeof window == "undefined") {
    return false;
  }
  if (localStorage.getItem("token")) {
    return localStorage.getItem("token");
  } else {
    localStorage.removeItem("token");
    return false;
  }
};

