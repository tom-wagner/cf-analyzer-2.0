import React, { useEffect } from "react";
import Navbar from "./../components/Navbar";
import IndexPage from "./index";
import AboutPage from "./about";
import FaqPage from "./faq";
import PricingPage from "./pricing";
import ContactPage from "./contact";
import AnalyzePage from "./analyze";
import { Switch, Route, Router } from "./../util/router";
// import FirebaseActionPage from "./firebase-action";
import NotFoundPage from "./not-found";
import Footer from "./../components/Footer";
import "./../util/analytics.ts";
// import { AuthProvider } from "./../util/auth";
import { ThemeProvider } from "./../util/theme";

function loadScript(src: string, position: HTMLElement | null, id: string) {
  if (!position) {
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', id);
  script.src = src;
  position.appendChild(script);
}

function App(props: any) {
  useEffect(() => {
    loadScript(
      // TODO: Replace with PROD API KEY
      `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_LOCALHOST_KEY}&libraries=places`,
      document.querySelector('head'),
      'google-maps',
    );
  }, [])

  return (
    // {/* TODO: Consider using Globals for styling */}
    <ThemeProvider>
      {/* <AuthProvider> */}
      <Router>
        <>
          <Navbar
            color="light"
            logo="https://i.imgur.com/9P1gSFZ.png"
            logoInverted="https://cfanalyzer.com/logo.webp"
          />

          <Switch>
            <Route exact path="/" component={IndexPage} />

            <Route exact path="/about" component={AboutPage} />

            <Route exact path="/faq" component={FaqPage} />

            <Route exact path="/pricing" component={PricingPage} />

            <Route exact path="/contact" component={ContactPage} />

            {/* <Route exact={false} strict={false} path={"/^\/analyze\/.*$/"} component={AnalyzePage} /> */}
            <Route exact path="/analyze" component={AnalyzePage} />

            <Route
              path='/how-i-bought-a-1.5mm-fourplex-with-60000-down'
              component={() => { 
                window.location.href = 'https://twitter.com/twbuilds/status/1332807426056335366'; 
                return null;
              }}
            />

            {/* <Route
              exact
              path="/firebase-action"
              component={FirebaseActionPage}
            /> */}

            <Route component={NotFoundPage} />
          </Switch>

          <Footer
            bgColor="light"
            size="normal"
            bgImage=""
            bgImageOpacity={1}
            description="Best in class real estate analysis software"
            copyright="© 2021 TW Builds LLC"
            logo="https://i.imgur.com/9P1gSFZ.png"
            logoInverted="https://cfanalyzer.com/logo.webp"
            sticky={true}
          />
        </>
      </Router>
      {/* </AuthProvider> */}
    </ThemeProvider>
  );
}

export default App;
