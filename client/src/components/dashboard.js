import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { Card, CardActions, CardContent, Typography, Button, CardActionArea, CardMedia, Grid } from '@material-ui/core';
import { getTests } from '../helper/Test';
import NavBar from "./nav";
import { Redirect } from 'react-router';
import { isAuthenticated } from '../helper/Auth';

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 345,
    minWidth: 345,
  }
}));

export default function Dashboard(props) {
  const classes = useStyles();
  const [values, setValues] = useState([]);

  useEffect(() => {
    getTests().then(async result => {
      if (result.success === true) {
        setValues(result.data.results)
      } else {
        localStorage.removeItem("token")
        window.location.reload()
      }
    })
  }, [props.history])

  const performRedirect = () => {
    if (localStorage.getItem("test-token")) {
      return <Redirect to="/student/questions" />;
    }
    if (!isAuthenticated()) {
      console.log("Instruction Token" + isAuthenticated());
      localStorage.removeItem("token");
      return <Redirect to="/" />;
    }
  };

  const handleSelect = (id) => {
    var test = values.find(i => i._id === id)
    localStorage.setItem("test", JSON.stringify(test))
    props.history.push("/student/test/" + id)
  }

  return (
    <React.Fragment>
      {performRedirect()}
      <NavBar>
        <Grid direction="column">
          {
            values.filter(item => (new Date(item.endTime)).getTime() > ((new Date()).getTime())).length > 0 ?
              <Container>
                <Typography style={{ paddingTop: "1rem" }} variant="h5" gutterBottom component="div">
                  Ongoing Tests
                </Typography>
                <Box my={2}>
                  <Grid
                    container
                    direction="row"
                    justify="right"
                    alignItems="center"
                    spacing={4}
                  >
                    {values.filter(item => (new Date(item.endTime)).getTime() > ((new Date()).getTime()))
                      .map((item) => {
                        return (
                          <Grid item key={item._id}>
                            <Card className={classes.card}>
                              <CardActionArea>
                                <CardMedia
                                  component="img"
                                  alt="Contemplative Reptile"
                                  height="140"
                                  image={item.testUrl ? item.testUrl : "https://png.pngtree.com/background/20210710/original/pngtree-recruitment-background-banner-picture-image_1037995.jpg"}
                                  title="Contemplative Reptile"
                                />
                                <CardContent>
                                  <Typography gutterbottom variant="h5" component="h2">
                                    {item.title.toUpperCase()}
                                  </Typography>
                                  {item.description ? <Typography variant="body2" color="textSecondary" component="p">
                                    {item.description.toUpperCase()}
                                  </Typography> : <></>}
                                  <Typography variant="body2" color="textSecondary" component="p">
                                    Start Time : {(new Date(item.startTime)).toLocaleString(navigator.language || navigator.languages[0], {
                                      // weekday: 'short', // long, short, narrow
                                      day: 'numeric', // numeric, 2-digit
                                      year: 'numeric', // numeric, 2-digit
                                      month: 'long', // numeric, 2-digit, long, short, narrow
                                      hour: 'numeric', // numeric, 2-digit
                                      minute: 'numeric', // numeric, 2-digit
                                      second: 'numeric', // numeric, 2-digit
                                    })}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary" component="p">
                                    Duration : {item.duration.hour + "h " + item.duration.minute + "m"}
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                              <CardActions>
                                {
                                  // {(new Date(item.startTime)).toLocaleString(navigator.language || navigator.languages[0], {
                                  //   // weekday: 'short', // long, short, narrow
                                  //   day: 'numeric', // numeric, 2-digit
                                  //   year: 'numeric', // numeric, 2-digit
                                  //   month: 'long', // numeric, 2-digit, long, short, narrow
                                  //   hour: 'numeric', // numeric, 2-digit
                                  //   minute: 'numeric', // numeric, 2-digit
                                  //   second: 'numeric', // numeric, 2-digit
                                  // })} + 
                                  ((new Date(item.endTime)).getTime()) > ((new Date()).getTime()) ? <Button size="small" style={{ color: "blue" }} onClick={() => handleSelect(item._id)}>
                                    Start
                                  </Button> : <Button size="small" color="muted" >
                                    Ended
                                  </Button>
                                }
                              </CardActions>
                            </Card>
                          </Grid>
                        )
                      })}
                  </Grid>
                </Box>
              </Container>
              : <></>
          }

        </Grid>
        <Grid direction="column">
          {values.filter(item => (new Date(item.endTime)).getTime() <= ((new Date()).getTime())).length > 0 ?
            <Container>
              <Typography style={{ paddingTop: "1rem" }} variant="h5" gutterBottom component="div">
                Expired Tests
              </Typography>
              <Box my={2}>
                <Grid
                  container
                  direction="row"
                  justify="right"
                  alignItems="center"
                  spacing={4}
                >
                  {values.filter(item => (new Date(item.endTime)).getTime() <= ((new Date()).getTime()))
                    .map((item) => {
                      return (
                        <Grid item key={item._id}>
                          <Card className={classes.card}>
                            <CardActionArea>
                              <CardMedia
                                component="img"
                                alt="Contemplative Reptile"
                                height="140"
                                image={item.testUrl ? item.testUrl : "http://validata-software.com/images/blog/wp-content/uploads/2017/02/service-automation_banner.png"}
                                title="Contemplative Reptile"
                              />
                              <CardContent>
                                <Typography gutterbottom variant="h5" component="h2">
                                  {item.title.toUpperCase()}
                                </Typography>
                                {item.description ? <Typography variant="body2" color="textSecondary" component="p">
                                  {item.description.toUpperCase()}
                                </Typography> : <></>}
                                <Typography variant="body2" color="textSecondary" component="p">
                                  Start Time : {(new Date(item.startTime)).toLocaleString(navigator.language || navigator.languages[0], {
                                    // weekday: 'short', // long, short, narrow
                                    day: 'numeric', // numeric, 2-digit
                                    year: 'numeric', // numeric, 2-digit
                                    month: 'long', // numeric, 2-digit, long, short, narrow
                                    hour: 'numeric', // numeric, 2-digit
                                    minute: 'numeric', // numeric, 2-digit
                                    second: 'numeric', // numeric, 2-digit
                                  })}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                  Duration : {item.duration.hour + "h " + item.duration.minute + "m"}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                            <CardActions>
                              {
                                ((new Date(item.endTime)).getTime()) > ((new Date()).getTime()) ? <Button size="small" style={{ color: "blue" }} onClick={() => handleSelect(item._id)}>
                                  Start
                                </Button> : <Button size="small" color="muted" >
                                  Ended
                                </Button>
                              }
                            </CardActions>
                          </Card>
                        </Grid>
                      )
                    })}
                </Grid>
              </Box>
            </Container>
            : <></>}
        </Grid>
      </NavBar>
    </React.Fragment >
  );
}
