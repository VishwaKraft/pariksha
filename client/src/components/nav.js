import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import Drawer from "@mui/material/Drawer";
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Zoom from '@mui/material/Zoom';
import logo from "../images/blockchainIcon.png";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useRouter } from "next/router";
import { Box } from '@mui/material';
import Image from 'next/image';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  main: {
    display: "flex"
  },
  card: {
    maxWidth: 345,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1
  },
  appBar: {
    backgroundColor: "#ffffff",
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appBarSpacer: theme.mixins.toolbar,
  round: {
    borderRadius: "50%"
  },
  icon: {
    color: "white",
  },
  title: {
    flexGrow: 1,
  },
  drawerClose: {
    backgroundColor: theme.palette.primary.main,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
}));

function ScrollTop(props) {
  const { children, window } = props;
  const classes = useStyles();
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
        {children}
      </div>
    </Zoom>
  );
}

ScrollTop.propTypes = {
  children: PropTypes.element.isRequired,
  window: PropTypes.func,
};

function BackToTop(props) {
  const classes = useStyles();
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState({ initials: '', photo: '', email: '' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let photo = localStorage.getItem("profileUrl");
      let intials = '';
      if (!photo) {
        let name = localStorage.getItem("name") || "";
        let nameArr = name.split(" ");
        if (nameArr.length === 1 && nameArr[0]) {
          intials = nameArr[0].charAt(0).toUpperCase();
        } else if (nameArr.length > 1) {
          intials = nameArr[0].charAt(0).toUpperCase() + nameArr[nameArr.length - 1].charAt(0).toUpperCase();
        }
      }
      let email = localStorage.getItem("email") || "";
      setUserProfile({ initials: intials, photo, email });
    }
  }, []);

  const handleLogout = () => {
    toast.success('Logout Successfully!');

    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("profileUrl");
    router.push('/');
  };

  const open = false;

  return (
    <React.Fragment>
      <div className={classes.main}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}>
          <Toolbar className={classes.toolBar}>
            <div className={classes.title}>
              <Link href="/student/dashboard" passHref legacyBehavior>
                <a>
                  <Image src={logo} style={{ width: "3rem", height: "3rem" }} alt="banner" />
                </a>
              </Link>
            </div>
            <ul className="navbar-nav me-2 mb-2 mb-lg-0">
              <li className="nav-item dropdown">
              {!userProfile.photo ? <div className="nav-link  bg-primary text-light rounded-circle text-center" style={{ width: "2.5rem", height: "2.5rem", fontSize: "1.2rem", display: 'flex', alignItems: 'center', justifyContent: 'center' }} id="navbarDropdown" role="button" onClick={toggleDropdown} aria-expanded={dropdownOpen ? "true" : "false"}>
                <p style={{margin: 0}}>{userProfile.initials}</p>
              </div>
              :
              <img alt="profilePhoto" src={userProfile.photo} className="text-light rounded-circle" style={{ width: "2.5rem", height: "2.5rem", objectFit: 'cover', cursor: 'pointer' }} id="navbarDropdown" role="button" onClick={toggleDropdown} aria-expanded={dropdownOpen ? "true" : "false"} />
              }
                <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`} aria-labelledby="navbarDropdown" style={{ position: 'absolute' }}>
                  <li><span className="dropdown-item" >{userProfile.email}</span></li>
                  <li><span className="dropdown-item" >Software Engineer 1</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><span className="dropdown-item" >
                    <button className="dropdown-item" onClick={handleLogout} style={{cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center'}}> <ExitToAppIcon style={{marginRight: '8px'}} /> Logout </button></span>
                  </li>
                </ul>
              </li>
            </ul>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
        >
          <div className="navRoot" >
            <span className="hashedinLogo">
              <span className="hashedinTitle">
                Hashed
                <span className="hashedinText">In</span>
              </span>
              <span className="deloitteTitle"> By Deloitte </span>
            </span>
          </div>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Box>
            {props.children}
          </Box>
        </main>
        <Toolbar id="back-to-top-anchor" disableGutters={true} />
        <ScrollTop {...props}>
          <Fab color="secondary" size="small" aria-label="scroll back to top">
            <KeyboardArrowUpIcon />
          </Fab>
        </ScrollTop>
      </div>
    </React.Fragment >
  );
};

export default BackToTop;