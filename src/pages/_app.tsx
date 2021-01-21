import React from "react";
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

function App(props: any) {
  return (
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

            <Route exact path="/analyze" component={AnalyzePage} />

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
