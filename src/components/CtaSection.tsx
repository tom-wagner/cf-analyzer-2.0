import React from "react";
import Section from "./Section";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import SectionHeader from "./SectionHeader";
import Button from "@material-ui/core/Button";
import { Link } from "./../util/router";

function CtaSection(props: any) {
  return (
    <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      <Container>
        <Box textAlign="center">
          <Grid
            container={true}
            alignItems="center"
            justify="center"
            spacing={5}
          >
            <Grid item={true} xs={12} md="auto">
              <SectionHeader
                title={props.title}
                subtitle={props.subtitle}
                size={4}
              />
            </Grid>
            <Grid item={true} xs={12} md="auto">
              <Button
                variant="contained"
                size="large"
                color={props.buttonColor}
                component={Link}
                to={props.buttonPath}
              >
                {props.buttonText}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Section>
  );
}

export default CtaSection;
