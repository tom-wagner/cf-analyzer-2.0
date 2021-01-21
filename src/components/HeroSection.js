import React from "react";
import Section from "./Section";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import SectionHeader from "./SectionHeader";
import Button from "@material-ui/core/Button";
import { Link } from "./../util/router.js";

function HeroSection(props) {
  return (
    <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      <Container>
        <Box textAlign="center">
          <SectionHeader
            title={props.title}
            subtitle={props.subtitle}
            size={4}
          />

          <Button
            variant="contained"
            size="large"
            color={props.buttonColor}
            component={Link}
            to={props.buttonPath}
          >
            {props.buttonText}
          </Button>
        </Box>
      </Container>
    </Section>
  );
}

export default HeroSection;
