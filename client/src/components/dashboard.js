import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Card, CardActions, CardContent, Typography, Button, CardActionArea, CardMedia, Grid } from '@mui/material';
import { getTests } from '../helper/Test';
import NavBar from "./nav";
import { useRouter } from 'next/router';
import { isAuthenticated } from '../helper/Auth';
import useStudentAuth from '../hooks/useStudentAuth';
import CircularProgress from "@mui/material/CircularProgress";

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 345,
    minWidth: 345,
  }
}));

export default function Dashboard() {
  const classes = useStyles();
  const [values, setValues] = useState([]);
  const router = useRouter();
  const { loading: authLoading, authenticated } = useStudentAuth();

  useEffect(() => {
    if (authenticated) {
      if (typeof window !== 'undefined' && localStorage.getItem("test-token")) {
         router.push("/student/questions");
         return;
      }
      
      getTests().then(async result => {
        if (result && result.success === true) {
          setValues(result.data.results)
        } else {
          localStorage.removeItem("token")
          router.push('/');
        }
      })
    }
  }, [router, authenticated])

  const handleSelect = (id) => {
    var test = values.find(i => i._id === id)
    localStorage.setItem("test", JSON.stringify(test))
    router.push("/student/test/" + id)
  }

  if (authLoading || !authenticated) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></div>;
  }

  return (
    <React.Fragment>
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
                                  <Typography gutterBottom variant="h5" component="h2">
                                    {item.title.toUpperCase()}
                                  </Typography>
                                  {item.description ? <Typography variant="body2" color="textSecondary" component="p">
                                    {item.description.toUpperCase()}
                                  </Typography> : <></>}
                                  <Typography variant="body2" color="textSecondary" component="p">
                                    Start Time : {(new Date(item.startTime)).toLocaleString(undefined, {
                                      day: 'numeric',
                                      year: 'numeric',
                                      month: 'long',
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      second: 'numeric',
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
                                  </Button> : <Button size="small" color="inherit" disabled >
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
                                <Typography gutterBottom variant="h5" component="h2">
                                  {item.title.toUpperCase()}
                                </Typography>
                                {item.description ? <Typography variant="body2" color="textSecondary" component="p">
                                  {item.description.toUpperCase()}
                                </Typography> : <></>}
                                <Typography variant="body2" color="textSecondary" component="p">
                                  Start Time : {(new Date(item.startTime)).toLocaleString(undefined, {
                                    day: 'numeric',
                                    year: 'numeric',
                                    month: 'long',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                  })}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                  Duration : {item.duration.hour + "h " + item.duration.minute + "m"}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                            <CardActions>
                              <Button size="small" color="inherit" disabled >
                                Ended
                              </Button>
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
