import React from 'react';
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import { FormControl, Grid, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { addQuestion, addQuestions } from '../../../helper/admin';
import { toast } from 'react-toastify';
const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(2, 0),
        width: "100%"
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(1, 3),
        },
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
    noLabel: {
        marginTop: theme.spacing(3),
    }
}));

export default function BasicTextFields() {
    const classes = useStyles();
    const [state, setState] = React.useState({
        selectedFile: "",
        selectedImageFile: "",
        question: "",
        one: "",
        two: "",
        three: "",
        four: "",
        correct: "",
        category: "",
        filename: "Choose a file"
    });


    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.value });
    };

    const { question, one, two, three, four, correct, category, selectedFile, selectedImageFile, filename } = state;

    const fileSelectedHandler = (event) => {
        setState({
            ...state,
            selectedFile: event.target.files[0],
            filename: document.getElementById('contained-button-file').value.replace("fakepath", "...")
        })
    }

    const fileSelectedImageHandler = (event) => {
        setState({
            ...state,
            selectedImageFile: event.target.files[0],
        })
    }


    const handleSubmit = () => {
        let formData = new FormData();
        if (selectedImageFile !== "") formData.append('image', selectedImageFile);
        formData.append('question', question);
        formData.append('one', one);
        formData.append('two', two);
        formData.append('three', three);
        formData.append('four', four);
        formData.append('correct', correct);
        formData.append('category', category);
        addQuestion(formData)
            .then(res => {
                if (res.success === true) {
                    toast.success("Question Saved Successfully!!")
                    setState({
                        question: "",
                        selectedImageFile: "",
                        one: "",
                        two: "",
                        three: "",
                        four: "",
                        correct: "",
                        category: ""
                    });
                } else {
                    throw new Error(res.errors !== undefined ? res.errors[0].msg : res.msg)
                }
            })
            .catch(err => toast.error(err.message))
    }
    const fileUploadHandler = (event) => {
        event.preventDefault();
        let formData = new FormData();
        formData.append('file', selectedFile);

        addQuestions(formData)
            .then(res => {
                if (res.success === true) {
                    toast.success("Questions Uploaded Successfully!!")
                    setState({
                        question: "",
                        one: "",
                        two: "",
                        three: "",
                        four: "",
                        correct: "",
                        category: ""
                    });
                } else {
                    throw new Error(res.errors !== undefined ? res.errors[0].msg : res.msg)
                }
            })
            .catch(err => toast.error(err.message))
    }
    return (
        <Grid
            container
            spacing={2}
            direction="row"
            justifyContent="center"
            alignItems="center"
        >
            <Grid item lg={4} sm={12}>

                <Paper style={{ padding: "2rem" }} >
                    <Typography variant="h5" align="center" style={{ margin: ".5rem" }}> Have a CSV ?</Typography>
                    <form>
                        <label htmlFor="contained-button-file" style={{ margin: ".5rem 0" }}>
                            <input accept=".csv" id="contained-button-file" type="file" style={{ display: "none" }} onChange={fileSelectedHandler} />
                            <Button variant="contained" component="span" style={{ marginRight: "1rem" }}>
                                Upload
                            </Button>
                            {filename}
                        </label>
                        <FormControl className={classes.formControl}>
                            <Button variant="contained" color="primary" align="center" type="submit"
                                onClick={fileUploadHandler} style={{ marginBottom: ".5rem" }}> Upload </Button>
                        </FormControl>
                        <span></span>
                    </form>

                </Paper>

            </Grid>

            <Grid item lg={8} sm={12}>
                <Paper>
                    <Typography variant="h5" align="center" style={{ paddingTop: "1rem" }}> Create Question</Typography>
                    <form className={classes.root} noValidate autoComplete="off">

                        <TextField
                            id="outlined-full-width"
                            label="Question"
                            placeholder="Question"
                            style={{ flexGrow: 1 }}
                            value={question}
                            name="question"
                            onChange={handleChange}
                            margin="normal"
                        />
                        <label htmlFor="button-file" style={{ margin: ".5rem 0", alignSelf: "end" }}>
                            <input id="button-file" type="file" style={{ display: "none" }} onChange={fileSelectedImageHandler} />
                            <Button variant="contained" component="span" style={{ marginRight: "1rem" }}>
                                {selectedImageFile === "" ? "Image" : "Selected"}
                            </Button>
                        </label>
                        <TextField
                            id="outlined-full-width"
                            label="Option 1"
                            placeholder="Option 1"
                            fullWidth
                            value={one}
                            name="one"
                            onChange={handleChange}
                            margin="normal"
                        />   <TextField
                            id="outlined-full-width"
                            label="Option 2"
                            placeholder="Option 2"
                            fullWidth
                            value={two}
                            name="two"
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            id="outlined-full-width"
                            label="Option 3"
                            placeholder="Option 3"
                            fullWidth
                            value={three}
                            name="three"
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            id="outlined-full-width"
                            label="Option 4"
                            placeholder="Option 4"
                            fullWidth
                            value={four}
                            name="four"
                            onChange={handleChange}
                            margin="normal"
                        />
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Correct Answer</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={correct}
                                label="Correct"
                                onChange={handleChange}
                                name="correct"
                            >
                                <MenuItem value="one">1</MenuItem>
                                <MenuItem value="two">2</MenuItem>
                                <MenuItem value="three">3</MenuItem>
                                <MenuItem value="four">4</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            id="outlined-full-width"
                            label="Category"
                            placeholder="Category"
                            fullWidth
                            value={category}
                            name="category"
                            onChange={handleChange}
                            margin="normal"
                        />
                        <FormControl className={classes.formControl} gutterbottom="true">
                            <Button variant="contained" color="primary" align="center" onClick={handleSubmit} style={{ margin: "1rem 0" }}> Submit </Button>
                        </FormControl>

                    </form>
                </Paper>

            </Grid>

        </Grid>

    );
}
