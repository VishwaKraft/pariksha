import { isAuthenticated } from "./Auth";
export const getTestToken = async (id) => {
  const token = await isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/student/test-token/` + id,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const getQuestions = async (lang) => {
  const token = localStorage.getItem("test-token");
  let url
  if (lang) {
    url = process.env.REACT_APP_API_URL + `/test/get-questions?category=` + lang
  } else {
    url = process.env.REACT_APP_API_URL + `/test/get-questions`
  }
  return fetch(
    url,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const submitAnswer = (res) => {
  const token = localStorage.getItem("test-token");
  return fetch(process.env.REACT_APP_API_URL + `/test/submit-responses`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: "Bearer " + token,
    },
    body: JSON.stringify({ responses: [res] }),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const endTest = (res) => {
  const token = localStorage.getItem("test-token");
  return fetch(process.env.REACT_APP_API_URL + `/test/end-test`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: "Bearer " + token,
    },
    body: JSON.stringify(res),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const submitFeedback = (res) => {
  const token = isAuthenticated();
  return fetch(process.env.REACT_APP_API_URL + `/student/submit-feedback`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: "Bearer " + token,
    },
    body: JSON.stringify(res),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const cheatingCounter = () => {
  const token = localStorage.getItem("test-token");
  return fetch(process.env.REACT_APP_API_URL + `/test/unfairAttempt`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: "Bearer " + token,
    },
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getTests = async () => {
  const token = await isAuthenticated();
  if (token === false) return false;
  return fetch(
    process.env.REACT_APP_API_URL + `/student/tests`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const selectTest = async (id) => {
  const token = await isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/student/test/${id}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
    }
  )
    .then((response) => {
      console.log(response)
      return { ...response.json(), status: response.status };
    })
    .catch((err) => err);
};