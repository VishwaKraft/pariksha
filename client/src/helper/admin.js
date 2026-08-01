import { isAuthenticated } from "./Auth";

export const getCount = () => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/count`,
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

export const getUsers = (page, limit, search) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/users?page=` + page + "&limit=" + limit + (search ? "&search=" + search : ""),
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

export const getResponse = (page, limit, search) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/responses?page=` + page + "&limit=" + limit + (search ? "&search=" + search : ""),
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

export const deleteResponse = (id, user) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/response/${id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify(user)
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};
export const updateUser = (id, user) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/user/${id}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify(user)
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const deleteUser = (id) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/user/${id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      }
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const addQuestion = (question) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/add-question`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        authorization: "Bearer " + token,
      },
      body: question
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const addQuestions = (formData) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/upload-questions`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        authorization: "Bearer " + token,
      },
      body: formData
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};


export const getQuestions = (page, limit) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/questions?page=` + page + "&limit=" + limit,
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

export const getCategory = () => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/category`,
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

export const addTest = (test) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/test`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        authorization: "Bearer " + token,
      },
      body: test
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const getTests = (page, limit) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/tests?page=` + page + "&limit=" + limit,
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

export const updateTest = (id, test) => {
  const token = isAuthenticated();
  test.startTime = (new Date(test.startTime)).getTime()
  test.endTime = (new Date(test.endTime)).getTime()
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/test/${id}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify(test)
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const deleteTest = (id) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/test/${id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      }
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const updateQuestion = (id, question) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/question/${id}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify(question)
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const deleteQuestion = (id) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/question/${id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      }
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => err);
};

export const getFeedbacks = (page, limit) => {
  const token = isAuthenticated();
  return fetch(
    process.env.REACT_APP_API_URL + `/admin/feedbacks?page=` + page + "&limit=" + limit,
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